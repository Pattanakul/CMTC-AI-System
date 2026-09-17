import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const {
  SKILL_DIR,
  WORKSPACE_DIR,
  RUNTIME_PYTHON,
  SOURCE_PPTX,
  TMP_DIR,
  FINAL_PPTX,
} = process.env;

for (const [name, value] of Object.entries({ SKILL_DIR, WORKSPACE_DIR, RUNTIME_PYTHON, SOURCE_PPTX, TMP_DIR, FINAL_PPTX })) {
  if (!value || (name !== "RUNTIME_PYTHON" && !path.isAbsolute(value))) {
    throw new Error(`Set absolute ${name}`);
  }
}

await fs.mkdir(TMP_DIR, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });

const presentation = await PresentationFile.importPptx(await FileBlob.load(SOURCE_PPTX));

function setText(id, text) {
  const target = presentation.resolve(id);
  target.text = text;
}

function setCell(tableId, row, col, value) {
  const table = presentation.resolve(tableId);
  table.cells.set(row, col, value);
}

function setNote(slideIndex, note) {
  const slide = presentation.slides.getItem(slideIndex);
  slide.speakerNotes.textFrame.setText(note);
}

// Slide 1
setText("sh/65g3298r", "รายงานความก้าวหน้าโครงงาน 1\nระดับความคืบหน้า 75-80%");
setText("sh/ts7md4r2", "ระบบจัดการข้อมูลและองค์ความรู้ด้วยปัญญาประดิษฐ์");
setText("sh/fu94fe98", "ชื่อโครงงาน : ระบบจัดการข้อมูลและองค์ความรู้ด้วยปัญญาประดิษฐ์\n(CMTC AI Knowledge Management System)\nผู้จัดทำ : นายพัฒนกุล เทปิน 68409010013\nอาจารย์ที่ปรึกษา : นายอนุชาติ รังสิยานนท์");
setText("sh/utg3698n", "การประเมินโครงการ 1 | แสดงผลงานที่พัฒนาได้จริงและแผนพัฒนาต่อให้สมบูรณ์");

// Slide 2
setText("sh/9072xkry", "1. ปัญหา ที่มา และเป้าหมายของโครงงาน");
setText("sh/ozy1ofad", "โครงงานนี้ช่วยให้ข้อมูลของวิทยาลัยถูกจัดเก็บ ค้นหา และนำกลับมาใช้ได้ง่ายขึ้น");
setText("sh/x4r21kru", "ปัญหา / ความจำเป็น");
setText("sh/w3i1sfa9", "ข้อมูลความรู้และเอกสารกระจายหลายจุด ทำให้ค้นหายากและตอบคำถามซ้ำบ่อย\nบุคลากรต้องการระบบกลางที่ช่วยจัดเก็บ ค้นหา และดูแลสิทธิ์การใช้งาน");
setText("sh/ove9o7yd", "วัตถุประสงค์");
setText("sh/9wnqhczy", "1. สร้างระบบกลางสำหรับจัดการข้อมูลความรู้ของวิทยาลัย\n2. ใช้ AI ช่วยค้นหาและตอบคำถามจากข้อมูลภายใน\n3. แยกสิทธิ์ผู้ใช้ให้เหมาะกับบทบาทงาน");
setText("sh/wjy9sry9", "ขอบเขตงาน");
setText("sh/xk7qlczu", "ระบบเข้าสู่ระบบ, จัดการบทความ, จัดการเอกสาร, แชท AI, สถิติการใช้งาน และหน้าผู้ดูแลระบบ\nส่วนเชื่อมต่ออัตโนมัติภายนอกยังไม่เปิดนำเสนอในรอบนี้");
setText("sh/bip8jmho", "สรุปสั้น");
setText("sh/cnupgny5", "ระบบมุ่งให้วิทยาลัยมีคลังความรู้ที่ค้นหาได้ง่าย ใช้ซ้ำได้ และควบคุมสิทธิ์ได้ชัดเจน");

// Slide 3
setText("sh/cza94vmx", "2. สรุปความก้าวหน้าปัจจุบัน");
setText("sh/d0jax03i", "ความคืบหน้าโดยรวมอยู่ที่ประมาณ 75-80% และสามารถสาธิตส่วนหลักของระบบได้แล้ว");
setText("sh/pcjqtg36", "78%");
setText("sh/n2l4fq98", "หมายเหตุ");
setText("sh/m1c3mlsn", "ตัวเลขนี้ประเมินจากฟังก์ชันหลักที่พัฒนาแล้ว การเชื่อมฐานข้อมูล และส่วนที่ยังต้องทดสอบเพิ่มเติมก่อนส่งงานสมบูรณ์");
const progressTable = "tb/j6ps72lo";
[
  ["งาน/โมดูล", "สถานะ", "หลักฐาน"],
  ["เข้าสู่ระบบและสิทธิ์ผู้ใช้", "เสร็จเป็นหลัก", "หน้า Login, แยกผู้ดูแลระบบและเจ้าหน้าที่"],
  ["จัดการองค์ความรู้", "เสร็จเป็นหลัก", "เพิ่ม แก้ไข เผยแพร่ และค้นหาบทความได้"],
  ["จัดการเอกสารและไฟล์", "กำลังปรับรายละเอียด", "มีหน้าอัปโหลด รายการเอกสาร และตัวกรอง"],
  ["แชท AI และสถิติ", "ใช้งานได้บางส่วน", "ตอบจากข้อมูลภายใน บันทึกประวัติ และมีหน้าสถิติ"],
].forEach((row, r) => row.forEach((value, c) => setCell(progressTable, r, c, value)));

// Slide 4
setText("sh/1cj2d8b6", "3. การออกแบบและวิธีดำเนินงาน");
setText("sh/0ba143al", "ระบบใช้เว็บแอปเป็นศูนย์กลาง เชื่อมฐานข้อมูล บทความ เอกสาร และบริการ AI");
setText("sh/doj29oba", "ภาพรวมการทำงานของระบบ");
setText("sh/sna103ap", "ผู้ใช้เข้าสู่ระบบ\nตรวจสอบบทบาทและสิทธิ์\nจัดการบทความหรือเอกสาร\nค้นหาข้อมูลหรือถาม AI\nระบบบันทึกผลและสถิติการใช้งาน");
setText("sh/kbm987y5", "เครื่องมือที่ใช้");
setText("sh/5cva1cfq", "Next.js: โครงเว็บและหน้าจอระบบ\nSupabase: ฐานข้อมูล เข้าสู่ระบบ และเก็บไฟล์\nOpenAI: ช่วยตอบคำถามและประมวลผลภาษา\nTailwind CSS: จัดหน้าตาเว็บให้ใช้งานง่าย");
setText("sh/jadsz2xk", "แนวทาง");
setText("sh/w72947yt", "เน้นระบบที่ใช้งานได้จริงก่อน ได้แก่ ล็อกอิน ข้อมูลความรู้ เอกสาร แชท AI และสถิติ จากนั้นค่อยทดสอบและปรับความแม่นยำ");

// Slide 5
setText("sh/dgbulwnm", "4. ผลงานที่ดำเนินการเสร็จแล้ว");
setText("sh/cf2tcr61", "ส่วนที่ทำได้แล้วเป็นฟังก์ชันหลักที่สามารถเปิดสาธิตจากระบบจริง");
setText("sh/l4bupwny", "หน้าผู้ดูแลระบบ");
setText("sh/032tgr6d", "มีแดชบอร์ดแสดงภาพรวม จำนวนข้อมูลความรู้ ข้อมูลที่เผยแพร่ และจำนวนผู้ใช้งาน\nใช้สำหรับติดตามสถานะของระบบ");
setText("sh/w32dkbuh", "คลังความรู้และเอกสาร");
setText("sh/x4vedgvm", "เพิ่ม แก้ไข และจัดสถานะข้อมูลความรู้ได้\nมีหน้าเอกสารพร้อมการค้นหาและตัวกรอง เพื่อเตรียมข้อมูลให้ AI ใช้งาน");
setText("sh/k7mxovud", "แชท AI และสถิติ");
setText("sh/58vehgvy", "ผู้ใช้ถามคำถามเป็นภาษาไทยได้\nระบบค้นหาข้อมูลที่เกี่ยวข้องและบันทึกสถิติ เพื่อดูคำถามที่พบบ่อยหรือจุดที่ข้อมูลยังไม่ครบ");
setText("sh/j6dwfqds", "หลักฐาน");
setText("sh/sb6xsvu9", "มีหน้าเว็บจริง โค้ดระบบ ฐานข้อมูล และหน้าจอที่สามารถสาธิตการทำงานหลักได้");

// Slide 6
setText("sh/yhg7epsj", "5. การทดสอบเบื้องต้น");
setText("sh/zi98nu94", "ทดสอบจากการใช้งานจริงของแต่ละหน้า เพื่อดูว่าส่วนหลักทำงานได้ตามที่ออกแบบไว้");
setText("sh/98rqt4r6", "");
setText("sh/ml07i9sv", "");
setText("sh/oryp8fah", "ทดสอบจากการเข้าใช้งานจริงของแต่ละหน้า ตรวจการบันทึกข้อมูล และตรวจการตอบกลับของ AI จากข้อมูลภายใน");
setText("sh/w32twb6l", "ข้อค้นพบ");
setText("sh/v2tcn650", "ส่วนหลักทำงานได้ แต่ยังต้องเพิ่มข้อมูลตัวอย่าง ทดสอบหลายบัญชี และปรับคำตอบ AI ให้แม่นยำขึ้น");
const testTable = "tb/hgv6dwfm";
[
  ["รายการทดสอบ", "วิธีทดสอบ", "ผลที่คาดหวัง", "ผลที่ได้", "สถานะ"],
  ["เข้าสู่ระบบ", "ลองบัญชีผู้ดูแลและเจ้าหน้าที่", "เข้าหน้าตามสิทธิ์", "ทำงานได้", "ผ่าน"],
  ["บทความความรู้", "เพิ่ม แก้ไข เผยแพร่", "ข้อมูลถูกบันทึกและแสดงผล", "ทำงานได้", "ผ่าน"],
  ["แชท AI", "ถามคำถามจากข้อมูลในระบบ", "ตอบเป็นภาษาไทยและอ้างอิงข้อมูล", "ยังต้องปรับความแม่นยำ", "กำลังปรับ"],
].forEach((row, r) => row.forEach((value, c) => setCell(testTable, r, c, value)));

// Slide 7
setText("sh/cb2tkvap", "6. ปัญหา อุปสรรค และการแก้ไข");
setText("sh/dcbud0ra", "ระหว่างพัฒนาพบข้อจำกัดด้านโครงสร้างข้อมูล สิทธิ์ผู้ใช้ และความแม่นยำของคำตอบ AI");
setText("sh/kzmdova1", "สรุป");
setText("sh/l0vuh0rm", "ปัญหาหลักไม่ได้อยู่ที่การสร้างหน้าเว็บเท่านั้น แต่รวมถึงการจัดข้อมูลให้ดีพอสำหรับค้นหาและตอบคำถาม");
const issueTable = "tb/vm9czels";
[
  ["ปัญหาที่พบ", "สาเหตุ", "แนวทางแก้ไขที่ดำเนินการ", "ผลหลังแก้ไข"],
  ["สิทธิ์ผู้ใช้ซับซ้อน", "มีหลายบทบาทในระบบ", "แยกเส้นทางผู้ดูแลและเจ้าหน้าที่", "ควบคุมการเข้าถึงได้ดีขึ้น"],
  ["ข้อมูลเอกสารยังไม่สม่ำเสมอ", "ไฟล์และบทความมีรูปแบบต่างกัน", "เพิ่มหน้าจัดการเอกสารและสถานะ", "เตรียมข้อมูลได้เป็นระบบขึ้น"],
  ["AI บางครั้งตอบกว้างเกินไป", "ข้อมูลอ้างอิงยังไม่ครบ", "ให้ระบบดึงบทความที่เกี่ยวข้องก่อนตอบ", "คำตอบเริ่มตรงกับข้อมูลภายในมากขึ้น"],
].forEach((row, r) => row.forEach((value, c) => setCell(issueTable, r, c, value)));

// Slide 8
setText("sh/18byd4zy", "7. งานที่ยังเหลือและแผนพัฒนาสู่ 100%");
setText("sh/g72x4zyd", "งานต่อไปเน้นการทดสอบจริง เพิ่มข้อมูลตัวอย่าง และปรับประสบการณ์ใช้งานให้พร้อมส่งงานสมบูรณ์");
setText("sh/tkby9kzm", "แผนต่อ");
setText("sh/sjix0zy1", "งานที่เหลือเป็นงานเก็บรายละเอียดและตรวจคุณภาพ เพื่อให้ระบบพร้อมใช้งานจริงมากขึ้นในโครงการถัดไป");
const remainingTable = "tb/0z6pgzup";
[
  ["งานที่เหลือ", "สถานะปัจจุบัน", "สิ่งที่จะดำเนินการต่อ", "เป้าหมาย/หลักฐานเมื่อเสร็จ"],
  ["ทดสอบกับข้อมูลจริง", "มีโครงสร้างรองรับแล้ว", "เพิ่มข้อมูลตัวอย่างหลายหมวด", "ค้นหาและตอบคำถามได้ครอบคลุม"],
  ["ปรับหน้าใช้งาน", "หน้าหลักทำงานแล้ว", "แก้จุดที่ข้อความหรือปุ่มยังไม่ชัด", "ผู้ใช้เข้าใจขั้นตอนได้ง่าย"],
  ["จัดทำรายงานและสาธิต", "รวบรวมหลักฐานบางส่วนแล้ว", "เก็บภาพหน้าจอ ผลทดสอบ และคู่มือสั้น", "พร้อมนำเสนอผลงาน 100%"],
].forEach((row, r) => row.forEach((value, c) => setCell(remainingTable, r, c, value)));

// Slide 9
setText("sh/1cfmhgne", "8. การแบ่งหน้าที่และผลงานรายบุคคล");
setText("sh/0b65obm9", "ผู้จัดทำรับผิดชอบตั้งแต่การออกแบบระบบ พัฒนาเว็บ เชื่อมฐานข้อมูล และทดสอบเบื้องต้น");
setText("sh/9gzml0nq", "หลักฐาน");
setText("sh/ofq5svm5", "สามารถอธิบายโครงสร้างระบบ หน้าที่ของแต่ละหน้า และขั้นตอนการพัฒนาที่ทำไปแล้วได้");
const personTable = "tb/4j2p4rud";
[
  ["ชื่อสมาชิก", "หน้าที่รับผิดชอบ", "สิ่งที่ทำสำเร็จ", "หลักฐาน"],
  ["นายพัฒนกุล เทปิน", "วิเคราะห์และออกแบบระบบ", "กำหนดขอบเขต ฟังก์ชัน และโครงสร้างข้อมูล", "README, โครงหน้าเว็บ, ฐานข้อมูล"],
  ["นายพัฒนกุล เทปิน", "พัฒนาเว็บและฐานข้อมูล", "ทำหน้า Login, Dashboard, Knowledge, Documents และ Users", "Source Code และหน้าจอระบบ"],
  ["นายพัฒนกุล เทปิน", "เชื่อม AI และทดสอบ", "ทำระบบ Chat, บันทึกประวัติ และหน้าสถิติ", "API, ผลทดสอบ และการสาธิต"],
].forEach((row, r) => row.forEach((value, c) => setCell(personTable, r, c, value)));

// Slide 10
setText("sh/xc3mho32", "9. สรุปผลการดำเนินงานและสาธิต");
setText("sh/cbu58j2h", "ระบบพัฒนาไปถึงระดับที่สาธิตการใช้งานหลักได้ และยังเหลืองานทดสอบเพื่อความสมบูรณ์");
setText("sh/l036l83y", "ระดับความสำเร็จ");
setText("sh/kzu5c32t", "ความก้าวหน้าปัจจุบัน : 75-80%\n\nส่วนสำคัญที่ทำสำเร็จ :\nล็อกอินและสิทธิ์ผู้ใช้\nคลังความรู้และเอกสาร\nแชท AI และสถิติ");
setText("sh/s7yt4b21", "สิ่งที่พิสูจน์ได้");
setText("sh/d87uxg3m", "ระบบเปิดใช้งานจากหน้าเว็บได้\nเพิ่มและจัดการข้อมูลได้\nAI ตอบคำถามจากข้อมูลภายในได้ในระดับเบื้องต้น");
setText("sh/0bit8b2d", "เป้าหมายภาคเรียนหน้า");
setText("sh/1cru1g3y", "เพิ่มข้อมูลจริงให้มากขึ้น\nทดสอบกับผู้ใช้หลายบทบาท\nปรับคำตอบ AI และจัดทำรายงานฉบับสมบูรณ์");
setText("sh/fapcz6ls", "สาธิตผลงานจริง");
setText("sh/ozitcv29", "แนะนำการสาธิต: เข้าสู่ระบบ แสดงแดชบอร์ด เพิ่มข้อมูลความรู้ ถาม AI และดูสถิติการใช้งาน");
setText("sh/p0ru503u", "ขอบคุณครับ | คำถามจากคณะกรรมการ");

// Slide 11
setText("sh/xcryxg7y", "ข้อควรเตรียมก่อนนำเสนอ");
setText("sh/wbih4b6d", "เตรียมสาธิตจากระบบจริง พร้อมหลักฐานสำรองเพื่อให้การนำเสนอราบรื่น");
setText("sh/n69grmpw", "เตรียมบัญชีทดลองสำหรับผู้ดูแลระบบและเจ้าหน้าที่\nเตรียมข้อมูลความรู้ตัวอย่างอย่างน้อย 5-10 รายการ\nเตรียมเอกสารตัวอย่างสำหรับอัปโหลดและค้นหา\nเตรียมคำถามภาษาไทยสำหรับทดสอบ AI\nเตรียมภาพหน้าจอหรือวิดีโอสำรอง หากอินเทอร์เน็ตหรือระบบมีปัญหา\nทบทวนสิ่งที่ยังเหลืออย่างตรงไปตรงมา เพราะงานยังอยู่ที่ 75-80%");
setText("sh/98rytw72", "หลักสำคัญ: นำเสนอเฉพาะสิ่งที่ทำได้จริง อธิบายให้เข้าใจง่าย และแสดงแผนพัฒนาต่อให้ครบ 100%");

for (let i = 0; i < presentation.slides.length; i += 1) {
  setNote(i, "เนื้อหาปรับให้สอดคล้องกับโครงงาน CMTC AI Knowledge Management System ระดับความคืบหน้า 75-80% โดยไม่เปิดเผยรายละเอียดฟังก์ชันเชื่อมต่ออัตโนมัติภายนอกในรอบนำเสนอนี้");
}

const draftPath = path.join(TMP_DIR, "candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(draftPath);

const { finalizePresentation } = await import(pathToFileURL(
  path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs"),
).href);

const result = await finalizePresentation({
  explicitTotalSlideCount: 11,
  requiredNativeTableOwnerSlides: [3, 6, 7, 8, 9],
  requiredNativeChartOwnerSlides: [],
  workspaceDir: WORKSPACE_DIR,
  candidatePath: draftPath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", "12192000,6858000",
    "--validate-bullet-geometry",
    "--validate-heading-fit",
    "--require-native-table-slide", "3",
    "--require-native-table-slide", "6",
    "--require-native-table-slide", "7",
    "--require-native-table-slide", "8",
    "--require-native-table-slide", "9",
  ],
  verifyArtifactToolImport: true,
  receiptPath: path.join(TMP_DIR, `${path.basename(FINAL_PPTX)}.validation.json`),
});

await fs.writeFile(path.join(TMP_DIR, "finalizer-result.json"), JSON.stringify(result, null, 2), "utf8");
