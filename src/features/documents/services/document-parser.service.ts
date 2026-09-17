import { cleanMarkdown } from "./markdown.service";

export type SupportedMarkdownFileType = "pdf" | "docx" | "txt";

export interface ParseDocumentInput {
  fileName: string;
  fileType: string;
  buffer: Buffer;
  title?: string;
}

export interface ParseDocumentResult {
  markdown: string;
  parser: SupportedMarkdownFileType;
}

export class UnsupportedDocumentTypeError extends Error {
  constructor(fileType: string) {
    super(`ไม่รองรับการประมวลผลไฟล์ประเภท ${fileType || "unknown"}`);
    this.name = "UnsupportedDocumentTypeError";
  }
}

function ensurePdfParseDomPolyfills() {
  const globals = globalThis as unknown as Record<string, unknown>;

  if (!globals.DOMMatrix) {
    globals.DOMMatrix = class BasicDOMMatrix {
      a = 1;
      b = 0;
      c = 0;
      d = 1;
      e = 0;
      f = 0;

      constructor(init?: unknown) {
        if (Array.isArray(init)) {
          [this.a, this.b, this.c, this.d, this.e, this.f] = init
            .slice(0, 6)
            .map((value) => Number(value));
        }
      }

      multiplySelf() {
        return this;
      }

      preMultiplySelf() {
        return this;
      }

      translate() {
        return this;
      }

      scale() {
        return this;
      }

      invertSelf() {
        return this;
      }
    };
  }

  if (!globals.ImageData) {
    globals.ImageData = class BasicImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;

      constructor(dataOrWidth: Uint8ClampedArray | number, width?: number, height?: number) {
        if (typeof dataOrWidth === "number") {
          this.width = dataOrWidth;
          this.height = width ?? 0;
          this.data = new Uint8ClampedArray(this.width * this.height * 4);
          return;
        }

        this.data = dataOrWidth;
        this.width = width ?? 0;
        this.height = height ?? 0;
      }
    };
  }

  if (!globals.Path2D) {
    globals.Path2D = class BasicPath2D {
      addPath() {
        return undefined;
      }
    };
  }
}

function normalizeFileType(fileName: string, fileType: string): string {
  const type = fileType.toLowerCase();
  if (type) return type.replace(/^\./, "");
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

async function parsePdf(input: ParseDocumentInput): Promise<string> {
  ensurePdfParseDomPolyfills();
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(input.buffer) });

  try {
    const result = await parser.getText({
      lineEnforce: true,
      parseHyperlinks: true,
      pageJoiner: "\n\n",
    });
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function parseDocx(input: ParseDocumentInput): Promise<string> {
  const mammothModule = (await import("mammoth")) as unknown as {
    default?: {
      convertToMarkdown(input: { buffer: Buffer }): Promise<{
        value: string;
        messages: Array<{ message: string }>;
      }>;
    };
    convertToMarkdown(input: { buffer: Buffer }): Promise<{
      value: string;
      messages: Array<{ message: string }>;
    }>;
  };
  const mammoth = mammothModule.default ?? mammothModule;
  const result = await mammoth.convertToMarkdown({
    buffer: input.buffer,
  });

  if (result.messages.length > 0) {
    console.info("[Document] DOCX parser warnings", {
      fileName: input.fileName,
      warningCount: result.messages.length,
    });
  }

  return result.value;
}

function parseTxt(input: ParseDocumentInput): string {
  return input.buffer.toString("utf8");
}

export async function parseDocumentToMarkdown(
  input: ParseDocumentInput
): Promise<ParseDocumentResult> {
  const fileType = normalizeFileType(input.fileName, input.fileType);
  let extractedText: string;
  let parser: SupportedMarkdownFileType;

  console.info("[Document] Extracting text", {
    fileName: input.fileName,
    fileType,
  });

  if (fileType === "pdf") {
    parser = "pdf";
    extractedText = await parsePdf(input);
  } else if (fileType === "docx") {
    parser = "docx";
    extractedText = await parseDocx(input);
  } else if (fileType === "txt" || fileType === "text/plain") {
    parser = "txt";
    extractedText = parseTxt(input);
  } else {
    throw new UnsupportedDocumentTypeError(fileType);
  }

  if (!extractedText.trim()) {
    throw new Error("ไม่พบข้อความในเอกสาร");
  }

  console.info("[Document] Converting to Markdown", {
    fileName: input.fileName,
    parser,
  });

  const markdown = cleanMarkdown({
    title: input.title,
    text: extractedText,
  });

  if (!markdown.trim()) {
    throw new Error("ไม่สามารถสร้าง Markdown จากเอกสารนี้ได้");
  }

  console.info("[Document] Markdown generated", {
    fileName: input.fileName,
    parser,
    length: markdown.length,
  });

  return { markdown, parser };
}
