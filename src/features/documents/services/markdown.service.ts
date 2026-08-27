export interface MarkdownSource {
  title?: string;
  text: string;
}

const NUMBERED_HEADING_PATTERN = /^(\d+(?:\.\d+)*)[.)]?\s+(.+)$/;
const BULLET_PATTERN = /^[-*•]\s+/;
const ORDERED_LIST_PATTERN = /^\d+[.)]\s+/;

function escapeTableCell(value: string): string {
  return value.replace(/\|/g, "\\|").trim();
}

function looksLikeHeading(line: string): boolean {
  if (line.length > 120) return false;
  if (/^#{1,6}\s+/.test(line)) return true;
  if (NUMBERED_HEADING_PATTERN.test(line)) return true;
  if (/^[\p{L}\p{N}\s:()/-]+$/u.test(line) && !/[.!?。]$/.test(line)) {
    return line.length <= 80;
  }
  return false;
}

function normalizeHeading(line: string): string | null {
  const markdownHeading = line.match(/^(#{1,6})\s+(.+)$/);
  if (markdownHeading) {
    return `${markdownHeading[1]} ${markdownHeading[2].trim()}`;
  }

  const numbered = line.match(NUMBERED_HEADING_PATTERN);
  if (!numbered) return null;

  const level = Math.min(numbered[1].split(".").length, 6);
  return `${"#".repeat(level)} ${numbered[2].trim()}`;
}

function normalizeTable(line: string): string[] | null {
  const cells = line
    .split(/\t| {2,}/)
    .map((cell) => cell.trim())
    .filter(Boolean);

  if (cells.length < 2) return null;

  const row = `| ${cells.map(escapeTableCell).join(" | ")} |`;
  const separator = `| ${cells.map(() => "---").join(" | ")} |`;
  return [row, separator];
}

function dedupeRepeatedLines(lines: string[]): string[] {
  const counts = new Map<string, number>();
  for (const line of lines) {
    const key = line.trim();
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return lines.filter((line) => {
    const key = line.trim();
    if (!key) return true;
    return !(key.length <= 80 && (counts.get(key) ?? 0) >= 3);
  });
}

export function cleanMarkdown({ title, text }: MarkdownSource): string {
  const normalized = text
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+$/gm, "")
    .replace(/[ \t]{2,}/g, " ");

  const sourceLines = dedupeRepeatedLines(
    normalized
      .split("\n")
      .map((line) => line.trim())
  );

  const output: string[] = [];
  let previousWasBlank = true;
  let previousWasTableHeader = false;

  if (title?.trim()) {
    output.push(`# ${title.trim()}`);
    output.push("");
    previousWasBlank = true;
  }

  for (const rawLine of sourceLines) {
    const line = rawLine.trim();

    if (!line) {
      if (!previousWasBlank) output.push("");
      previousWasBlank = true;
      previousWasTableHeader = false;
      continue;
    }

    const heading = normalizeHeading(line);
    if (heading && looksLikeHeading(line)) {
      if (!previousWasBlank) output.push("");
      output.push(heading);
      output.push("");
      previousWasBlank = true;
      previousWasTableHeader = false;
      continue;
    }

    if (BULLET_PATTERN.test(line) || ORDERED_LIST_PATTERN.test(line)) {
      output.push(line.replace(/^•\s+/, "- "));
      previousWasBlank = false;
      previousWasTableHeader = false;
      continue;
    }

    const tableRows = normalizeTable(line);
    if (tableRows) {
      output.push(tableRows[0]);
      if (!previousWasTableHeader) output.push(tableRows[1]);
      previousWasBlank = false;
      previousWasTableHeader = true;
      continue;
    }

    if (!previousWasBlank && output.length > 0) {
      const previous = output[output.length - 1];
      const canJoin =
        previous &&
        !previous.startsWith("#") &&
        !BULLET_PATTERN.test(previous) &&
        !ORDERED_LIST_PATTERN.test(previous) &&
        !previous.startsWith("|") &&
        !/[.!?:;。]$/.test(previous);

      if (canJoin) {
        output[output.length - 1] = `${previous} ${line}`;
        previousWasTableHeader = false;
        continue;
      }
    }

    output.push(line);
    previousWasBlank = false;
    previousWasTableHeader = false;
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
