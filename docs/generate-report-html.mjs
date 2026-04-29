import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const inputPath = path.join(rootDir, "docs", "INFORME_FUNCIONAMIENTO_SUGARBAY.md");
const outputPath = path.join(
  rootDir,
  "docs",
  "INFORME_FUNCIONAMIENTO_SUGARBAY.html",
);

const markdown = fs.readFileSync(inputPath, "utf8");
const lines = markdown.replace(/\r\n/g, "\n").split("\n");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseInline(raw) {
  let out = escapeHtml(raw);
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  return out;
}

const body = [];
let paragraphBuffer = [];
let listType = null;
let inCodeBlock = false;
let codeBuffer = [];

function flushParagraph() {
  if (paragraphBuffer.length === 0) return;
  const text = paragraphBuffer.join(" ").trim();
  if (text.length > 0) {
    body.push(`<p>${parseInline(text)}</p>`);
  }
  paragraphBuffer = [];
}

function closeList() {
  if (!listType) return;
  body.push(listType === "ul" ? "</ul>" : "</ol>");
  listType = null;
}

function openList(nextType) {
  if (listType === nextType) return;
  closeList();
  listType = nextType;
  body.push(nextType === "ul" ? "<ul>" : "<ol>");
}

for (const line of lines) {
  if (line.startsWith("```")) {
    flushParagraph();
    closeList();

    if (!inCodeBlock) {
      inCodeBlock = true;
      codeBuffer = [];
    } else {
      inCodeBlock = false;
      body.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
      codeBuffer = [];
    }
    continue;
  }

  if (inCodeBlock) {
    codeBuffer.push(line);
    continue;
  }

  const trimmed = line.trim();
  if (trimmed.length === 0) {
    flushParagraph();
    closeList();
    continue;
  }

  const headingMatch = /^(#{1,6})\s+(.*)$/.exec(trimmed);
  if (headingMatch) {
    flushParagraph();
    closeList();
    const level = headingMatch[1].length;
    body.push(`<h${level}>${parseInline(headingMatch[2])}</h${level}>`);
    continue;
  }

  const orderedMatch = /^\d+\.\s+(.*)$/.exec(trimmed);
  if (orderedMatch) {
    flushParagraph();
    openList("ol");
    body.push(`<li>${parseInline(orderedMatch[1])}</li>`);
    continue;
  }

  const unorderedMatch = /^-\s+(.*)$/.exec(trimmed);
  if (unorderedMatch) {
    flushParagraph();
    openList("ul");
    body.push(`<li>${parseInline(unorderedMatch[1])}</li>`);
    continue;
  }

  closeList();
  paragraphBuffer.push(trimmed);
}

flushParagraph();
closeList();

const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Informe Funcionamiento Sugarbay</title>
    <style>
      :root {
        --ink: #1f2937;
        --ink-soft: #4b5563;
        --heading: #111827;
        --border: #d1d5db;
        --code-bg: #f3f4f6;
      }
      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: var(--ink);
        font-family: "Segoe UI", Arial, sans-serif;
        line-height: 1.55;
      }
      .page {
        max-width: 980px;
        margin: 0 auto;
        padding: 42px 54px 64px;
      }
      h1, h2, h3, h4 {
        color: var(--heading);
        line-height: 1.28;
        page-break-after: avoid;
      }
      h1 {
        font-size: 30px;
        margin: 0 0 14px;
      }
      h2 {
        font-size: 24px;
        margin: 30px 0 12px;
        border-bottom: 1px solid var(--border);
        padding-bottom: 6px;
      }
      h3 {
        font-size: 18px;
        margin: 20px 0 10px;
      }
      p {
        margin: 10px 0;
        color: var(--ink);
      }
      ul, ol {
        margin: 8px 0 12px 24px;
        padding: 0;
      }
      li {
        margin: 4px 0;
      }
      code {
        background: var(--code-bg);
        border: 1px solid #e5e7eb;
        border-radius: 5px;
        padding: 1px 6px;
        font-family: "Consolas", "Courier New", monospace;
        font-size: 0.94em;
      }
      pre {
        background: var(--code-bg);
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px 14px;
        overflow-x: auto;
      }
      pre code {
        border: 0;
        padding: 0;
        background: transparent;
      }
      hr {
        border: 0;
        border-top: 1px solid var(--border);
        margin: 20px 0;
      }
      strong {
        color: #111827;
      }
      @page {
        size: A4;
        margin: 20mm;
      }
    </style>
  </head>
  <body>
    <main class="page">
${body.map((line) => `      ${line}`).join("\n")}
    </main>
  </body>
</html>
`;

fs.writeFileSync(outputPath, html, "utf8");
console.log("HTML generado en:", outputPath);
