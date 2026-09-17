import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cacheService } from '@/features/chat/services/cache.service';
import { conversationService } from '@/features/chat/services/conversation.service';
import { llmService } from '@/features/ai/services/llm.service';

type KnowledgeArticleContext = {
  id: string;
  title: string;
  status?: string | null;
  is_publish?: boolean | null;
  deleted_at?: string | null;
  question: string | null;
  answer: string | null;
  content: string | null;
  summary: string | null;
  source: string | null;
};

type DocumentContext = {
  id: string;
  file_name?: string | null;
  display_title: string;
  description: string | null;
  category: string | null;
  keywords: string[] | null;
  tags: string[] | null;
  markdown_content: string | null;
  storage_path: string | null;
  status?: string | null;
  processing_status?: string | null;
  ai_ready?: boolean | null;
  created_at?: string | null;
  document_position?: number | null;
};

type StaffProfileContext = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  status: string | null;
  department_id: string | null;
  departments?:
    | {
        code: string | null;
        name: string | null;
      }
    | Array<{
      code: string | null;
      name: string | null;
    }>
    | null;
};

type DepartmentContext = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  office: string | null;
  status: boolean | null;
};

type AnalyticsSummaryContext = {
  totalQuestions: number;
  answeredQuestions: number;
  unansweredQuestions: number;
  averageConfidence: number | null;
  averageResponseTimeMs: number | null;
  latestQuestions: Array<{
    question: string;
    answer: string;
    confidence_score: number | null;
    created_at: string | null;
  }>;
};

type AuthDirectoryUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

type RankedContext =
  | {
      type: 'knowledge';
      score: number;
      item: KnowledgeArticleContext;
    }
  | {
      type: 'document';
      score: number;
      item: DocumentContext;
    }
  | {
      type: 'staff';
      score: number;
      item: StaffProfileContext;
    }
  | {
      type: 'department';
      score: number;
      item: DepartmentContext;
    };

const MAX_CONTEXT_CHARACTERS = 1800;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  try {
    return JSON.stringify(error);
  } catch {
    return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  }
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function normalizeRole(role: string | null | undefined) {
  return role?.trim().toLowerCase().replace(/[_\s-]+/g, ' ') ?? '';
}

function isAdminRole(role: string | null | undefined) {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'super admin' || normalizedRole === 'admin';
}

function articleText(article: KnowledgeArticleContext) {
  return [
    article.title,
    article.question,
    article.answer,
    article.summary,
    article.content,
    article.source,
  ].filter(Boolean).join('\n');
}

function documentText(document: DocumentContext) {
  return [
    document.display_title,
    document.file_name,
    document.description,
    document.category,
    ...(document.keywords || []),
    ...(document.tags || []),
    document.markdown_content,
  ].filter(Boolean).join('\n');
}

function staffDisplayName(profile: StaffProfileContext) {
  if (profile.full_name?.trim()) return profile.full_name.trim();

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
  return name || 'ไม่ระบุชื่อ';
}

function staffDepartment(profile: StaffProfileContext) {
  if (Array.isArray(profile.departments)) {
    return profile.departments[0] || null;
  }

  return profile.departments || null;
}

function staffText(profile: StaffProfileContext) {
  const department = staffDepartment(profile);
  return [
    staffDisplayName(profile),
    profile.email,
    profile.phone,
    profile.role,
    profile.status,
    department?.name,
    department?.code,
  ].filter(Boolean).join('\n');
}

function getMetadataString(
  metadata: Record<string, unknown> | null | undefined,
  key: string
) {
  const value = metadata?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

async function getAuthDirectoryProfiles(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  try {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) throw error;

    return ((data.users || []) as AuthDirectoryUser[]).map((user) => {
      const metadata = user.user_metadata || {};
      const fullName =
        getMetadataString(metadata, 'full_name') ||
        getMetadataString(metadata, 'name') ||
        [getMetadataString(metadata, 'first_name'), getMetadataString(metadata, 'last_name')]
          .filter(Boolean)
          .join(' ')
          .trim() ||
        null;

      return {
        id: user.id,
        full_name: fullName,
        email: user.email || getMetadataString(metadata, 'email'),
        phone: getMetadataString(metadata, 'phone'),
        first_name: getMetadataString(metadata, 'first_name'),
        last_name: getMetadataString(metadata, 'last_name'),
        role: null,
        status: null,
        department_id: null,
        departments: null,
      } satisfies StaffProfileContext;
    });
  } catch (error) {
    console.warn('Unable to load Supabase Auth users for staff directory:', getErrorMessage(error));
    return [];
  }
}

function mergeProfileWithAuthUser(
  profile: StaffProfileContext,
  authProfile: StaffProfileContext | undefined
): StaffProfileContext {
  if (!authProfile) return profile;

  return {
    ...profile,
    full_name: profile.full_name || authProfile.full_name,
    email: profile.email || authProfile.email,
    phone: profile.phone || authProfile.phone,
    first_name: profile.first_name || authProfile.first_name,
    last_name: profile.last_name || authProfile.last_name,
  };
}

function departmentText(department: DepartmentContext) {
  return [
    department.name,
    department.code,
    department.description,
    department.phone,
    department.email,
    department.office,
    department.status === false ? 'ปิดใช้งาน' : 'เปิดใช้งาน',
  ].filter(Boolean).join('\n');
}

function isGenericKnowledgeQuestion(question: string) {
  const normalizedQuestion = normalizeText(question);

  return [
    'ประชาสัมพันธ์',
    'ข่าว',
    'ข่าวสาร',
    'ประกาศ',
    'ความรู้',
    'ข้อมูล',
  ].some((word) => normalizedQuestion.includes(word));
}

function isGenericDocumentQuestion(question: string) {
  const normalizedQuestion = normalizeText(question);

  return [
    'เอกสาร',
    'ไฟล์',
    'แบบฟอร์ม',
    'ดาวน์โหลด',
    'pdf',
    'document',
  ].some((word) => normalizedQuestion.includes(word));
}

function isStaffQuestion(question: string) {
  const normalizedQuestion = normalizeText(question);

  return [
    'บุคลากร',
    'รายชื่อบุคลากร',
    'รายชื่อเจ้าหน้าที่',
    'รายชื่อผู้ใช้',
    'พนักงาน',
    'เจ้าหน้าที่',
    'อาจารย์',
    'ครู',
    'ผู้ใช้',
    'ผู้ดูแล',
    'user',
    'staff',
    'admin',
    'แอดมิน',
    'ชื่อใคร',
    'ใครบ้าง',
  ].some((word) => normalizedQuestion.includes(word));
}

function isDepartmentQuestion(question: string) {
  const normalizedQuestion = normalizeText(question);

  return [
    'แผนก',
    'สาขา',
    'department',
    'ภาควิชา',
    'ห้อง',
    'สำนักงาน',
  ].some((word) => normalizedQuestion.includes(word));
}

function isAnalyticsQuestion(question: string) {
  const normalizedQuestion = normalizeText(question);

  return [
    'สถิติ',
    'การใช้งาน',
    'วันนี้',
    'กี่คำถาม',
    'ตอบได้',
    'ตอบไม่ได้',
    'analytics',
    'history',
  ].some((word) => normalizedQuestion.includes(word));
}

function isBroadSystemQuestion(question: string) {
  const normalizedQuestion = normalizeText(question);

  return [
    'ข้อมูลทั้งหมด',
    'ข้อมูลในระบบ',
    'ฐานข้อมูล',
    'database',
    'มีข้อมูลอะไร',
    'มีอะไรบ้าง',
    'ทั้งหมด',
    'เรียกใช้ข้อมูล',
    'ดูข้อมูล',
    'สรุปข้อมูล',
    'ภาพรวม',
  ].some((word) => normalizedQuestion.includes(word));
}

function isDatabaseQuestion(question: string) {
  return (
    isBroadSystemQuestion(question) ||
    isStaffQuestion(question) ||
    isDepartmentQuestion(question) ||
    isAnalyticsQuestion(question) ||
    isGenericDocumentQuestion(question) ||
    isGenericKnowledgeQuestion(question)
  );
}

function getExcerpt(content: string | null) {
  if (!content) return '';

  return content.length > MAX_CONTEXT_CHARACTERS
    ? `${content.slice(0, MAX_CONTEXT_CHARACTERS)}...`
    : content;
}

function getQuestionWords(question: string) {
  return normalizeText(question)
    .split(/[\s,.;:!?()[\]{}"'“”‘’|/\\]+/)
    .filter((word) => word.length > 1);
}

function scoreText({
  question,
  title,
  text,
}: {
  question: string;
  title: string;
  text: string;
}) {
  const normalizedQuestion = normalizeText(question);
  const normalizedTitle = normalizeText(title);
  const normalizedText = normalizeText(text);
  const questionWords = getQuestionWords(question);
  let score = 0;

  if (normalizedTitle && normalizedQuestion.includes(normalizedTitle)) score += 8;
  if (normalizedTitle && normalizedTitle.includes(normalizedQuestion)) score += 8;
  if (normalizedText && normalizedText.includes(normalizedQuestion)) score += 5;

  for (const word of questionWords) {
    if (normalizedTitle.includes(word)) score += 3;
    if (normalizedText.includes(word)) score += 1;
  }

  return score;
}

async function getRelevantKnowledge(
  supabase: Awaited<ReturnType<typeof createClient>>,
  question: string
) {
  const { data, error } = await supabase
    .from('knowledge_articles')
    .select('*')
    .limit(20);

  if (error) throw error;

  const normalizedQuestion = normalizeText(question);
  const articles = ((data || []) as KnowledgeArticleContext[]).filter((article) => {
    const publishFlagExists = typeof article.is_publish === 'boolean';
    const statusExists = typeof article.status === 'string';
    const isPublished = publishFlagExists
      ? article.is_publish
      : !statusExists || article.status === 'PUBLISHED';

    return isPublished && !article.deleted_at;
  });

  const scoredArticles = articles
    .map((article) => {
      let score = scoreText({
        question: normalizedQuestion,
        title: article.title,
        text: articleText(article),
      });

      const normalizedArticleQuestion = normalizeText(article.question || '');
      if (normalizedArticleQuestion && normalizedQuestion.includes(normalizedArticleQuestion)) {
        score += 6;
      }

      return { article, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (
    scoredArticles.length > 0 ||
    (!isGenericKnowledgeQuestion(question) && !isBroadSystemQuestion(question))
  ) {
    return scoredArticles;
  }

  return articles.slice(0, 3).map((article) => ({ article, score: 1 }));
}

async function getRelevantDocuments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  question: string
) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) throw error;

  const documents = (data || []) as DocumentContext[];
  const documentsWithPosition = documents.map((document, index) => ({
    ...document,
    document_position: index + 1,
  }));

  const scoredDocuments = documentsWithPosition
    .map((document) => ({
      document,
      score: scoreText({
        question,
        title: document.display_title,
        text: documentText(document),
      }),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (
    scoredDocuments.length > 0 ||
    (!isGenericDocumentQuestion(question) && !isBroadSystemQuestion(question))
  ) {
    return scoredDocuments;
  }

  return documentsWithPosition.slice(0, 5).map((document) => ({ document, score: 1 }));
}

async function getRelevantStaffProfiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  question: string
) {
  let profileRows: unknown[] | null = null;
  let profileError: unknown = null;

  const extendedResult = await supabase
    .from('profiles')
    .select('id,full_name,email,phone,first_name,last_name,role,status,department_id,departments:department_id(code,name)')
    .order('created_at', { ascending: false })
    .limit(50);

  profileRows = extendedResult.data;
  profileError = extendedResult.error;

  if (profileError) {
    const standardResult = await supabase
      .from('profiles')
      .select('id,first_name,last_name,role,status,department_id,departments:department_id(code,name)')
      .order('created_at', { ascending: false })
      .limit(50);

    profileRows = standardResult.data;
    profileError = standardResult.error;
  }

  if (profileError) {
    const plainResult = await supabase
      .from('profiles')
      .select('id,first_name,last_name,role,status,department_id')
      .order('created_at', { ascending: false })
      .limit(50);

    profileRows = plainResult.data;
    profileError = plainResult.error;
  }

  if (profileError) throw profileError;

  const profileItems = (profileRows || []) as StaffProfileContext[];
  const authProfiles = await getAuthDirectoryProfiles(supabase);
  const authProfileById = new Map(authProfiles.map((profile) => [profile.id, profile]));
  const profileIds = new Set(profileItems.map((profile) => profile.id));
  const profiles = [
    ...profileItems.map((profile) => mergeProfileWithAuthUser(profile, authProfileById.get(profile.id))),
    ...authProfiles.filter((profile) => !profileIds.has(profile.id)),
  ];

  const scoredProfiles = profiles
    .map((profile) => ({
      profile,
      score: scoreText({
        question,
        title: staffDisplayName(profile),
        text: staffText(profile),
      }),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (
    scoredProfiles.length > 0 ||
    (!isStaffQuestion(question) && !isBroadSystemQuestion(question))
  ) {
    return scoredProfiles;
  }

  return profiles.map((profile) => ({ profile, score: 1 }));
}

async function getRelevantDepartments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  question: string
) {
  const { data, error } = await supabase
    .from('departments')
    .select('id,code,name,description,phone,email,office,status')
    .order('name', { ascending: true })
    .limit(50);

  if (error) throw error;

  const departments = (data || []) as DepartmentContext[];
  const scoredDepartments = departments
    .map((department) => ({
      department,
      score: scoreText({
        question,
        title: department.name,
        text: departmentText(department),
      }),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (
    scoredDepartments.length > 0 ||
    (!isDepartmentQuestion(question) && !isBroadSystemQuestion(question))
  ) {
    return scoredDepartments;
  }

  return departments.map((department) => ({ department, score: 1 }));
}

function getBangkokDayRange() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const today = formatter.format(new Date());
  const start = new Date(`${today}T00:00:00+07:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

function isUnansweredAnalyticsItem(item: {
  answer: string | null;
  confidence_score: number | null;
}) {
  const answer = normalizeText(item.answer || '');
  return (
    (typeof item.confidence_score === 'number' && item.confidence_score < 0.5) ||
    answer.includes('ยังไม่พบ') ||
    answer.includes('ไม่พบข้อมูล') ||
    answer.includes('ไม่สามารถตอบ') ||
    answer.includes('ติดต่อเจ้าหน้าที่')
  );
}

async function getAnalyticsSummary(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<AnalyticsSummaryContext> {
  const { startIso, endIso } = getBangkokDayRange();
  const { data, error } = await supabase
    .from('ai_analytics')
    .select('question,answer,confidence_score,response_time_ms,created_at')
    .gte('created_at', startIso)
    .lt('created_at', endIso)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw error;

  const items = (data || []) as Array<{
    question: string;
    answer: string;
    confidence_score: number | null;
    response_time_ms: number | null;
    created_at: string | null;
  }>;

  const unansweredQuestions = items.filter(isUnansweredAnalyticsItem).length;
  const confidenceValues = items
    .map((item) => item.confidence_score)
    .filter((value): value is number => typeof value === 'number');
  const responseTimes = items
    .map((item) => item.response_time_ms)
    .filter((value): value is number => typeof value === 'number');

  return {
    totalQuestions: items.length,
    answeredQuestions: items.length - unansweredQuestions,
    unansweredQuestions,
    averageConfidence: confidenceValues.length
      ? confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length
      : null,
    averageResponseTimeMs: responseTimes.length
      ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length)
      : null,
    latestQuestions: items.slice(0, 5).map((item) => ({
      question: item.question,
      answer: item.answer,
      confidence_score: item.confidence_score,
      created_at: item.created_at,
    })),
  };
}

function formatContextItem(item: RankedContext, index: number) {
  if (item.type === 'knowledge') {
    const article = item.item;
    return [
      `แหล่งข้อมูล ${index + 1} (ข้อมูลประชาสัมพันธ์): ${article.title}`,
      article.answer ? `คำตอบที่บันทึกไว้: ${article.answer}` : null,
      article.summary ? `สรุป: ${article.summary}` : null,
      article.content ? `เนื้อหา: ${getExcerpt(article.content)}` : null,
      article.source ? `ที่มา: ${article.source}` : null,
    ].filter(Boolean).join('\n');
  }

  if (item.type === 'document') {
    const document = item.item;
    return [
      `แหล่งข้อมูล ${index + 1} (เอกสาร): ${document.display_title}`,
      document.document_position ? `ลำดับในหน้าจัดการเอกสาร: แถวที่ ${document.document_position} เมื่อเรียงตามวันที่อัปโหลดล่าสุด` : null,
      document.file_name ? `ชื่อไฟล์: ${document.file_name}` : null,
      document.description ? `คำอธิบาย: ${document.description}` : null,
      document.category ? `หมวดหมู่: ${document.category}` : null,
      document.keywords?.length ? `คีย์เวิร์ด: ${document.keywords.join(', ')}` : null,
      document.tags?.length ? `แท็ก: ${document.tags.join(', ')}` : null,
      document.storage_path ? `ที่เก็บไฟล์: ${document.storage_path}` : null,
      document.processing_status && document.processing_status !== 'READY'
        ? `สถานะประมวลผล: ${document.processing_status}`
        : null,
      document.markdown_content ? `เนื้อหาเอกสาร: ${getExcerpt(document.markdown_content)}` : null,
    ].filter(Boolean).join('\n');
  }

  if (item.type === 'staff') {
    const profile = item.item;
    const department = staffDepartment(profile);
    return [
      `แหล่งข้อมูล ${index + 1} (บุคลากร): ${staffDisplayName(profile)}`,
      profile.role ? `บทบาท: ${profile.role}` : null,
      profile.status ? `สถานะบัญชี: ${profile.status}` : null,
      department?.name ? `แผนก: ${department.name}` : null,
      department?.code ? `รหัสแผนก: ${department.code}` : null,
      profile.email ? `อีเมล: ${profile.email}` : null,
      profile.phone ? `เบอร์โทร: ${profile.phone}` : null,
    ].filter(Boolean).join('\n');
  }

  const department = item.item;
  return [
    `แหล่งข้อมูล ${index + 1} (แผนก): ${department.name}`,
    department.code ? `รหัสแผนก: ${department.code}` : null,
    department.description ? `รายละเอียด: ${department.description}` : null,
    department.office ? `ที่ตั้ง/สำนักงาน: ${department.office}` : null,
    department.phone ? `โทรศัพท์: ${department.phone}` : null,
    department.email ? `อีเมล: ${department.email}` : null,
    `สถานะ: ${department.status === false ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}`,
  ].filter(Boolean).join('\n');
}

function formatAnalyticsSummary(analyticsSummary: AnalyticsSummaryContext | null) {
  if (!analyticsSummary) return '';

  return [
    'สถิติการใช้งาน AI วันนี้:',
    `1. คำถามทั้งหมด: ${analyticsSummary.totalQuestions}`,
    `2. ตอบได้โดยประมาณ: ${analyticsSummary.answeredQuestions}`,
    `3. ตอบไม่ได้/ไม่พบข้อมูลโดยประมาณ: ${analyticsSummary.unansweredQuestions}`,
    analyticsSummary.averageConfidence !== null
      ? `4. ค่า confidence เฉลี่ย: ${(analyticsSummary.averageConfidence * 100).toFixed(0)}%`
      : null,
    analyticsSummary.averageResponseTimeMs !== null
      ? `5. เวลาตอบเฉลี่ย: ${analyticsSummary.averageResponseTimeMs} ms`
      : null,
    analyticsSummary.latestQuestions.length
      ? `คำถามล่าสุด:\n${analyticsSummary.latestQuestions.map((item, index) => `${index + 1}. ${item.question}`).join('\n')}`
      : null,
  ].filter(Boolean).join('\n');
}

function rankedContextSummary(item: RankedContext, index: number) {
  if (item.type === 'knowledge') {
    const article = item.item;
    const detail = article.answer || article.summary || article.content;

    return [
      `${index + 1}. ${article.title}${detail ? ` - ${getExcerpt(detail).slice(0, 220)}` : ''}`,
      article.source ? `   ที่มา: ${article.source}` : null,
    ].filter(Boolean).join('\n');
  }

  if (item.type === 'document') {
    const document = item.item;
    const detail = document.markdown_content || document.description || document.file_name || document.category;

    return [
      `${index + 1}. ${document.display_title}${document.document_position ? ` - แถวที่ ${document.document_position}` : ''}${document.processing_status && document.processing_status !== 'READY' ? `, สถานะ: ${document.processing_status}` : ''}`,
      detail ? `   รายละเอียด: ${getExcerpt(detail).slice(0, 220)}` : null,
    ].filter(Boolean).join('\n');
  }

  if (item.type === 'staff') {
    const profile = item.item;
    const department = staffDepartment(profile);
    const contact = [
      profile.email ? `อีเมล: ${profile.email}` : null,
      profile.phone ? `โทร: ${profile.phone}` : null,
    ].filter(Boolean).join(', ');

    return `${index + 1}. ${staffDisplayName(profile)} - ${profile.role || 'ไม่ระบุบทบาท'}, แผนก: ${department?.name || 'ไม่ระบุ'}, สถานะ: ${profile.status || 'ไม่ระบุ'}${contact ? `, ${contact}` : ''}`;
  }

  const department = item.item;
  const details = [
    department.description,
    department.office ? `ที่ตั้ง: ${department.office}` : null,
    department.phone ? `โทร: ${department.phone}` : null,
    department.email ? `อีเมล: ${department.email}` : null,
    `สถานะ: ${department.status === false ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}`,
  ].filter(Boolean).join(' | ');

  return `${index + 1}. ${department.name}${department.code ? ` (${department.code})` : ''}${details ? ` - ${details}` : ''}`;
}

function buildFallbackAnswer(
  rankedContext: RankedContext[],
  analyticsSummary: AnalyticsSummaryContext | null
) {
  if (rankedContext.length === 0 && !analyticsSummary) {
    return [
      'สรุปคำตอบ:',
      'ยังไม่พบข้อมูลที่เกี่ยวข้องในระบบตอนนี้ครับ',
      '',
      'สิ่งที่ลองทำได้:',
      '1. ใช้คำค้นที่เฉพาะขึ้น เช่น ชื่อเอกสาร ชื่อแผนก หรือชื่อบุคลากร',
      '2. ตรวจสอบว่าข้อมูลถูกเผยแพร่หรือเปิดใช้งานแล้ว',
      '3. ติดต่อเจ้าหน้าที่หากต้องการข้อมูลที่ยังไม่ได้บันทึกในระบบ',
    ].join('\n');
  }

  const fallbackParts = [
    'สรุปคำตอบ:',
    `พบข้อมูลที่เกี่ยวข้อง ${rankedContext.length} รายการในระบบครับ`,
  ];

  if (rankedContext.length > 0) {
    fallbackParts.push('', 'รายละเอียด:', rankedContext.map(rankedContextSummary).join('\n'));
  }

  const analyticsText = formatAnalyticsSummary(analyticsSummary);
  if (analyticsText) {
    fallbackParts.push('', analyticsText);
  }

  fallbackParts.push(
    '',
    'หมายเหตุ:',
    'ข้อมูลเอกสารที่ยังประมวลผลไม่สำเร็จจะแสดงจากชื่อไฟล์ หัวข้อ หรือหมวดหมู่ก่อน และยังไม่สามารถอ่านเนื้อหาเต็มในไฟล์ได้'
  );

  return fallbackParts.join('\n');
}

async function getPreviousMessages(conversationId: string) {
  try {
    return await conversationService.getMessages(conversationId);
  } catch (error) {
    console.warn('Unable to load chat history:', getErrorMessage(error));
    return [];
  }
}

async function saveChatMessage(
  message: Parameters<typeof conversationService.saveMessage>[0]
) {
  try {
    await conversationService.saveMessage(message);
  } catch (error) {
    console.warn('Unable to save chat message:', getErrorMessage(error));
  }
}

async function searchChatCache(question: string) {
  try {
    return await cacheService.searchCache(question);
  } catch (error) {
    console.warn('Unable to search AI cache:', getErrorMessage(error));
    return null;
  }
}

async function saveChatCache(question: string, answer: string, confidence: number) {
  try {
    await cacheService.saveCache(question, answer, confidence);
  } catch (error) {
    console.warn('Unable to save AI cache:', getErrorMessage(error));
  }
}

async function getContextSources(
  supabase: Awaited<ReturnType<typeof createClient>>,
  question: string
) {
  const asksStaff = isStaffQuestion(question);
  const asksDepartments = isDepartmentQuestion(question);
  const asksDocuments = isGenericDocumentQuestion(question);
  const asksAnalytics = isAnalyticsQuestion(question);
  const asksBroad = isBroadSystemQuestion(question);
  const asksSpecificContext = asksStaff || asksDepartments || asksDocuments || asksAnalytics;
  const asksKnowledge =
    isGenericKnowledgeQuestion(question) &&
    !asksBroad &&
    !asksSpecificContext;
  const shouldFetchBroadContext = asksBroad && !asksSpecificContext;
  const shouldFetchKnowledge = shouldFetchBroadContext || asksKnowledge;
  const shouldFetchDocuments = shouldFetchBroadContext || asksDocuments;
  const shouldFetchStaff = shouldFetchBroadContext || asksStaff;
  const shouldFetchDepartments = shouldFetchBroadContext || asksDepartments;
  const shouldFetchAnalytics = shouldFetchBroadContext || asksAnalytics;
  const [knowledgeResult, documentResult, staffResult, departmentResult, analyticsResult] = await Promise.allSettled([
    shouldFetchKnowledge ? getRelevantKnowledge(supabase, question) : Promise.resolve([]),
    shouldFetchDocuments ? getRelevantDocuments(supabase, question) : Promise.resolve([]),
    shouldFetchStaff ? getRelevantStaffProfiles(supabase, question) : Promise.resolve([]),
    shouldFetchDepartments ? getRelevantDepartments(supabase, question) : Promise.resolve([]),
    shouldFetchAnalytics ? getAnalyticsSummary(supabase) : Promise.resolve(null),
  ]);

  if (knowledgeResult.status === 'rejected') {
    console.warn('Unable to search knowledge articles:', getErrorMessage(knowledgeResult.reason));
  }

  if (documentResult.status === 'rejected') {
    console.warn('Unable to search documents:', getErrorMessage(documentResult.reason));
  }

  if (staffResult.status === 'rejected') {
    console.warn('Unable to search staff profiles:', getErrorMessage(staffResult.reason));
  }

  if (departmentResult.status === 'rejected') {
    console.warn('Unable to search departments:', getErrorMessage(departmentResult.reason));
  }

  if (analyticsResult.status === 'rejected') {
    console.warn('Unable to summarize AI analytics:', getErrorMessage(analyticsResult.reason));
  }

  return {
    relevantKnowledge: knowledgeResult.status === 'fulfilled' ? knowledgeResult.value : [],
    relevantDocuments: documentResult.status === 'fulfilled' ? documentResult.value : [],
    relevantStaffProfiles: staffResult.status === 'fulfilled' ? staffResult.value : [],
    relevantDepartments: departmentResult.status === 'fulfilled' ? departmentResult.value : [],
    analyticsSummary: analyticsResult.status === 'fulfilled' ? analyticsResult.value : null,
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    const canUsePrivilegedContext = isAdminRole(currentProfile?.role);
    let contextSupabase = supabase;

    if (canUsePrivilegedContext) {
      try {
        contextSupabase = createAdminClient() as unknown as typeof supabase;
      } catch (error) {
        console.warn('Unable to create admin Supabase client for chat context:', getErrorMessage(error));
      }
    }

    const { question, conversationId } = await request.json();

    if (!question || !conversationId) {
      return NextResponse.json({ error: 'Missing question or conversationId' }, { status: 400 });
    }

    await saveChatMessage({
      conversationId,
      role: 'user',
      content: question,
      sources: []
    });

    const usesLiveDatabase = isDatabaseQuestion(question);

    // 1. Search Cache
    const cached = usesLiveDatabase ? null : await searchChatCache(question);
    if (cached) {
      await saveChatMessage({
        conversationId,
        role: 'ai',
        content: cached.answer,
        sources: []
      });
      return NextResponse.json({ 
        answer: cached.answer, 
        sources: [], 
        confidence: cached.confidence_score, 
        responseTime: 0,
        conversationId 
      });
    }

    // 2. Direct AI call. The provider is selected from AI_PROVIDER.
    // Fetch previous messages for context
    const previousMessages = await getPreviousMessages(conversationId);
    const {
      relevantKnowledge,
      relevantDocuments,
      relevantStaffProfiles,
      relevantDepartments,
      analyticsSummary,
    } = await getContextSources(contextSupabase, question);

    const contextLimit =
      isStaffQuestion(question) || isDepartmentQuestion(question) || isGenericDocumentQuestion(question)
        ? 50
        : 10;

    const rankedContext: RankedContext[] = [
      ...relevantKnowledge.map(({ article, score }) => ({
        type: 'knowledge' as const,
        item: article,
        score,
      })),
      ...relevantDocuments.map(({ document, score }) => ({
        type: 'document' as const,
        item: document,
        score,
      })),
      ...relevantStaffProfiles.map(({ profile, score }) => ({
        type: 'staff' as const,
        item: profile,
        score,
      })),
      ...relevantDepartments.map(({ department, score }) => ({
        type: 'department' as const,
        item: department,
        score,
      })),
    ]
      .sort((a, b) => b.score - a.score)
      .slice(0, contextLimit);

    const sources = rankedContext.map((source) => {
      if (source.type === 'knowledge') {
        return {
          id: source.item.id,
          type: 'ข้อมูลประชาสัมพันธ์',
          title: source.item.title,
          source: source.item.source,
        };
      }

      if (source.type === 'document') {
        return {
          id: source.item.id,
          type: 'เอกสาร',
          title: source.item.display_title,
          source: source.item.storage_path,
        };
      }

      if (source.type === 'staff') {
        const department = staffDepartment(source.item);
        return {
          id: source.item.id,
          type: 'บุคลากร',
          title: staffDisplayName(source.item),
          source: department?.name || source.item.role,
        };
      }

      return {
        id: source.item.id,
        type: 'แผนก',
        title: source.item.name,
        source: source.item.code,
      };
    });

    if (analyticsSummary) {
      sources.push({
        id: 'today-ai-analytics',
        type: 'สถิติการใช้งาน',
        title: 'สถิติคำถาม AI วันนี้',
        source: 'ai_analytics',
      });
    }

    const databaseContext = [
      ...rankedContext.map((item, index) => formatContextItem(item, index)),
      formatAnalyticsSummary(analyticsSummary),
    ]
      .filter(Boolean)
      .join('\n\n');

    const sourceTypes = [
      'ข้อมูลประชาสัมพันธ์',
      'เอกสาร',
      'บุคลากร',
      'แผนก',
      'สถิติการใช้งาน',
    ].join(', ');

    const knowledgeContext = rankedContext
      .map((item, index) => formatContextItem(item, index))
      .join('\n\n');

    let text: string;
    let confidenceScore = 0.9; // placeholder

    try {
      text = await llmService.generateChatText({
        system: `คุณคือผู้ช่วย AI ในเว็บไซต์ของวิทยาลัยเทคนิคเชียงใหม่ ตอบเป็นภาษาไทย กระชับ สุภาพ และใช้ข้อมูลภายในเป็นหลัก

ค้นข้อมูลจากแหล่งข้อมูลภายในเหล่านี้: ${sourceTypes}

รูปแบบคำตอบที่ต้องใช้:
สรุปคำตอบ:
ตอบสั้น ๆ 1 ประโยคว่าพบอะไรหรือสรุปใจความสำคัญ

รายละเอียด:
1. รายการหรือข้อเท็จจริงที่เกี่ยวข้อง
2. ใส่รายละเอียดเท่าที่จำเป็น เช่น บทบาท แผนก สถานะ ตำแหน่งเอกสาร หรือช่องทางติดต่อ
3. ถ้ามีหลายรายการ ให้เรียงเป็นเลขลำดับ อ่านง่าย และให้แต่ละรายการอยู่ในบรรทัดเดียวถ้าทำได้

แหล่งข้อมูลที่ใช้:
ระบุประเภทข้อมูลที่ใช้ เช่น ข้อมูลประชาสัมพันธ์ เอกสาร บุคลากร แผนก หรือสถิติการใช้งาน

หมายเหตุ:
ใส่เฉพาะเมื่อมีข้อจำกัด เช่น เอกสารประมวลผลไม่สำเร็จ ข้อมูลไม่ครบ หรือเป็นค่าประมาณจากระบบ

หลักการตอบ:
- ตอบจากข้อมูลภายในที่ให้มาเท่านั้น
- ใช้หัวข้อ "สรุปคำตอบ:", "รายละเอียด:", "แหล่งข้อมูลที่ใช้:" และ "หมายเหตุ:" เมื่อเหมาะสม
- เว้นบรรทัดระหว่างแต่ละหัวข้อ
- อย่าเว้นบรรทัดว่างระหว่างรายการเลขลำดับ
- ห้ามตอบเป็นย่อหน้ายาวก้อนเดียว
- ถ้าข้อมูลมีน้อย ให้ตอบสั้นแต่ยังคงเป็นระบบ
- ถ้าถามเรื่องบุคลากร ให้ตอบชื่อ บทบาท สถานะบัญชี และแผนกเท่าที่มีในระบบ ห้ามเดาอีเมลหรือข้อมูลส่วนตัวที่ไม่มีใน context
- ถ้าถามเรื่องแผนก ให้ตอบชื่อ รหัส รายละเอียด ที่ตั้ง เบอร์โทร และอีเมลเท่าที่มี
- ถ้าถามเรื่องสถิติวันนี้ ให้ใช้สรุปจาก ai_analytics และระบุว่าเป็นการประมาณจากข้อมูลที่บันทึกในระบบ
- ถ้าถามว่าเอกสารอยู่ไหน ให้บอกชื่อเอกสาร ที่เก็บไฟล์ และแถวในหน้าจัดการเอกสารเมื่อเรียงตามวันที่อัปโหลดล่าสุด
- ถ้าข้อมูลภายในไม่เพียงพอ ให้ตอบอย่างซื่อสัตย์ว่ายังไม่พบข้อมูลในระบบ อย่าสร้างข้อมูลขึ้นเอง

ข้อมูลภายในที่เกี่ยวข้อง:
${databaseContext || knowledgeContext || 'ไม่พบข้อมูลภายในที่เกี่ยวข้อง'}`,
        messages: [
          ...previousMessages.map((message) => ({
            role: message.role === 'ai' ? 'assistant' as const : 'user' as const,
            content: message.content,
          })),
          { role: 'user', content: question }
        ]
      });
    } catch (error) {
      console.warn('Unable to generate AI response, using local data fallback:', getErrorMessage(error));
      text = buildFallbackAnswer(rankedContext, analyticsSummary);
      confidenceScore = rankedContext.length > 0 || analyticsSummary ? 0.65 : 0.3;
    }

    const duration = Date.now() - startTime;
    
    // 3. Save Cache & Message
    if (!usesLiveDatabase) {
      await saveChatCache(question, text, confidenceScore);
    }
    await saveChatMessage({
      conversationId,
      role: 'ai',
      content: text,
      sources,
      confidenceScore: confidenceScore
    });

    // Also log analytics directly
    const { error: analyticsError } = await supabase.from('ai_analytics').insert([{
      question,
      answer: text,
      response_time_ms: duration,
      confidence_score: confidenceScore,
      source_type: 'AI'
    }]);

    if (analyticsError) {
      console.warn('Unable to save AI analytics:', analyticsError.message);
    }

    return NextResponse.json({
      answer: text,
      sources,
      confidence: confidenceScore,
      responseTime: duration,
      conversationId
    });
  } catch (error) {
    console.error('AI processing error:', error);
    const message = getErrorMessage(error) || 'เกิดข้อผิดพลาดในการประมวลผลแชท';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

