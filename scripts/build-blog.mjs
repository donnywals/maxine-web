import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "blog");
const POSTS_DIR = path.join(BLOG_DIR, "posts");
const TEMPLATE_PATH = path.join(BLOG_DIR, "template.html");
const INDEX_PATH = path.join(BLOG_DIR, "index.html");
const INDEX_START_MARKER = "<!-- BLOG_POST_LIST_START -->";
const INDEX_END_MARKER = "<!-- BLOG_POST_LIST_END -->";

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function escapeHtml(text) {
  return text
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

function markdownToHtml(markdown) {
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

      if (value === "") {
        meta[key] = [];
      } else {
        meta[key] = value.replace(/^['"]|['"]$/g, "");
      }
    }
  }

  return { meta, body };
}

function extractFirstParagraph(markdownBody) {
  const sections = markdownBody
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const section of sections) {
    if (section.startsWith("#")) continue;
    if (section.startsWith("- ")) continue;
    if (/^\d+\.\s+/.test(section)) continue;
    return section.replace(/\n+/g, " ").trim();
  }

  return "";
}

function normalizeDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function fillTemplate(template, values) {
  let out = template;
  for (const [key, value] of Object.entries(values)) {
    out = out.replaceAll(`{{${key}}}`, value ?? "");
  }
  return out;
}

function build() {
  if (!fs.existsSync(POSTS_DIR)) {
    throw new Error(`Missing posts folder: ${POSTS_DIR}`);
  }

  const template = readText(TEMPLATE_PATH);
  const indexTemplate = readText(INDEX_PATH);

  const posts = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const outputMeta = [];

  for (const fileName of posts) {
    const fullPath = path.join(POSTS_DIR, fileName);
    const raw = readText(fullPath);
    const { meta, body } = parseFrontMatter(raw);

    const slug = String(meta.slug || fileName.replace(/\.md$/, ""));
    const title = String(meta.title || slug);
    const description = String(meta.description || "");
    const date = String(meta.date || "");
    const firstParagraph = extractFirstParagraph(body);

    const contentHtml = markdownToHtml(body);
    const postHtml = fillTemplate(template, {
      PAGE_TITLE: `${title} | Maxine Blog`,
      META_DESCRIPTION: escapeHtml(description || firstParagraph),
      SLUG: escapeHtml(slug),
      PUBLISHED_DATE: escapeHtml(normalizeDate(date)),
      POST_TITLE: escapeHtml(title),
      CONTENT: contentHtml,
    });

    writeText(path.join(BLOG_DIR, `${slug}.html`), postHtml);

    outputMeta.push({
      slug,
      title,
      description: description || firstParagraph,
      date,
      firstParagraph,
    });
  }

  outputMeta.sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return (Number.isNaN(db) ? 0 : db) - (Number.isNaN(da) ? 0 : da);
  });

  const cards = outputMeta.slice(0, 10).map((post) => {
    const paragraph = post.firstParagraph || post.description || "";
    return `
            <article class="rounded-3xl bg-white/5 p-8 shadow-sm ring-1 ring-white/20">
              <p class="text-sm text-gray-300">${escapeHtml(normalizeDate(post.date))}</p>
              <h2 class="mt-2 text-2xl font-semibold text-white">
                <a class="hover:text-gray-200" href="/blog/${escapeHtml(post.slug)}.html">${escapeHtml(post.title)}</a>
              </h2>
              <p class="mt-4 text-white/80">${escapeHtml(paragraph)}</p>
              <p class="mt-6 text-sm font-semibold text-white">
                <a href="/blog/${escapeHtml(post.slug)}.html">Read more -&gt;</a>
              </p>
            </article>`;
  });

  const startIndex = indexTemplate.indexOf(INDEX_START_MARKER);
  const endIndex = indexTemplate.indexOf(INDEX_END_MARKER);
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error(
      `blog/index.html must contain ${INDEX_START_MARKER} and ${INDEX_END_MARKER}.`,
    );
  }

  const prefix = indexTemplate.slice(
    0,
    startIndex + INDEX_START_MARKER.length,
  );
  const suffix = indexTemplate.slice(endIndex);
  const builtIndex = `${prefix}\n${cards.join("\n")}\n            ${suffix}`;

  writeText(INDEX_PATH, builtIndex);
  console.log(`Built ${outputMeta.length} blog posts.`);
}

build();
