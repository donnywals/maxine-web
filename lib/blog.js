import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "blog", "posts");

export function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatInline(text) {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return out;
}

export function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const chunks = [];
  let paragraph = [];
  let listType = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      chunks.push(`<p>${formatInline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };

  const closeList = () => {
    if (listType) {
      chunks.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === "") {
      flushParagraph();
      closeList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      closeList();
      const level = headingMatch[1].length;
      chunks.push(`<h${level}>${formatInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    const unorderedMatch = line.match(/^-\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType !== "ul") {
        closeList();
        listType = "ul";
        chunks.push("<ul>");
      }
      chunks.push(`<li>${formatInline(unorderedMatch[1])}</li>`);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType !== "ol") {
        closeList();
        listType = "ol";
        chunks.push("<ol>");
      }
      chunks.push(`<li>${formatInline(orderedMatch[1])}</li>`);
      continue;
    }

    closeList();
    paragraph.push(line);
  }

  flushParagraph();
  closeList();
  return chunks.join("\n");
}

function parseFrontMatter(fileContents) {
  const normalized = fileContents.replace(/^\uFEFF/, "");
  if (!normalized.startsWith("---\n")) {
    throw new Error("Markdown file is missing YAML front matter.");
  }

  const endMarker = "\n---\n";
  const endIndex = normalized.indexOf(endMarker, 4);
  if (endIndex === -1) {
    throw new Error("Front matter is not closed with '---'.");
  }

  const fmRaw = normalized.slice(4, endIndex);
  const body = normalized.slice(endIndex + endMarker.length).trim();
  const meta = {};
  let currentKey = null;

  for (const line of fmRaw.split(/\r?\n/)) {
    if (line.trim() === "") continue;

    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(meta[currentKey])) {
        meta[currentKey] = [];
      }
      meta[currentKey].push(listMatch[1].trim().replace(/^['"]|['"]$/g, ""));
      continue;
    }

    const kvMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim();
      const value = kvMatch[2].trim();
      currentKey = key;
      meta[key] = value === "" ? [] : value.replace(/^['"]|['"]$/g, "");
    }
  }

  return { meta, body };
}

function extractFirstParagraph(markdownBody) {
  const sections = markdownBody
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter(Boolean);

  for (const section of sections) {
    if (section.startsWith("#")) continue;
    if (section.startsWith("- ")) continue;
    if (/^\d+\.\s+/.test(section)) continue;
    return section.replace(/\n+/g, " ").trim();
  }

  return "";
}

export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getAllPosts() {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((fileName) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, fileName), "utf8");
      const { meta, body } = parseFrontMatter(raw);
      const slug = String(meta.slug || fileName.replace(/\.md$/, ""));
      const firstParagraph = extractFirstParagraph(body);
      return {
        slug,
        title: String(meta.title || slug),
        description: String(meta.description || firstParagraph),
        date: String(meta.date || ""),
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        firstParagraph,
        html: markdownToHtml(body),
      };
    })
    .sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return (Number.isNaN(db) ? 0 : db) - (Number.isNaN(da) ? 0 : da);
    });
}

export function getPostBySlug(rawSlug) {
  const slug = String(rawSlug).replace(/\.html$/, "");
  return getAllPosts().find((post) => post.slug === slug);
}
