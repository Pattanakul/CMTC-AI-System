// ─── User Types ────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'admin' | 'editor' | 'viewer'
  department?: string
  created_at: string
  updated_at: string
}

// ─── Knowledge Base Types ───────────────────────────────────────────────────────

export interface KnowledgeBase {
  id: string
  title: string
  description?: string
  content: string
  category_id: string
  tags: string[]
  author_id: string
  status: 'draft' | 'published' | 'archived'
  view_count: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  parent_id?: string
  order: number
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  color?: string
  created_at: string
}

// ─── AI Types ───────────────────────────────────────────────────────────────────

export interface AISearchResult {
  id: string
  title: string
  excerpt: string
  relevance_score: number
  category: string
  url: string
}

export interface AIChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: AISearchResult[]
  created_at: string
}

// ─── API Response Types ─────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// ─── Navigation Types ───────────────────────────────────────────────────────────

export interface NavItem {
  title: string
  href: string
  icon?: string
  badge?: string
  children?: NavItem[]
}
