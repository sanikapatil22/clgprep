import * as cheerio from "cheerio";
import pdfParse from "pdf-parse";

export type ParsedSyllabus = {
  course: string;
  modules: Array<{ title: string; topics: string[] }>;
};

export async function parseSyllabusPdf(buffer: Buffer): Promise<ParsedSyllabus> {
  const parsed = await pdfParse(buffer);
  return syllabusTextToJson(parsed.text);
}

export function parseSyllabusHtml(html: string): ParsedSyllabus {
  const $ = cheerio.load(html);
  return syllabusTextToJson($("body").text());
}

export function syllabusTextToJson(text: string): ParsedSyllabus {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const course = lines.find((line) => /database|operating|computer|course/i.test(line)) ?? "Imported Course";
  const modules = lines
    .filter((line) => /module|unit/i.test(line))
    .slice(0, 8)
    .map((line) => {
      const [, title = line, topicText = ""] = line.match(/(?:module|unit)\s*\d*[:.-]?\s*([^:]+):?(.*)/i) ?? [];
      return {
        title: title.trim(),
        topics: topicText
          .split(/,|;|\|/)
          .map((topic) => topic.trim())
          .filter(Boolean)
          .slice(0, 12),
      };
    });

  return {
    course,
    modules: modules.length ? modules : [{ title: "Foundations", topics: lines.slice(0, 8) }],
  };
}
