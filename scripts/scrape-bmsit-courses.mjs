import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as cheerio from "cheerio";
import pdfParse from "pdf-parse";

const SOURCE_URL = "https://bmsit.ac.in/autonomous.php";
const OUTPUT_PATH = "src/data/bmsit-course-catalog.json";

function clean(value) {
  return value.replace(/[`{}\r]/g, " ").replace(/\s+/g, " ").trim();
}

function extractSyllabusLinks(html) {
  const $ = cheerio.load(html);
  const links = [];

  $("[id]").each((_, batchEl) => {
    const batch = $(batchEl).attr("id");
    if (!/^20\d{2}$/.test(batch ?? "")) return;

    $(batchEl)
      .find(".timetable-box")
      .each((_, box) => {
        const department = clean($(box).find("h5").first().text());
        $(box)
          .find("a[href*=pdf]")
          .each((_, anchor) => {
            const label = clean($(anchor).text());
            const semester = label.match(/(\d+)(?:st|nd|rd|th)\s+Sem/i)?.[1];
            if (!department || !semester) return;

            links.push({
              batch: Number(batch),
              department,
              semester: Number(semester),
              label,
              pdf: new URL($(anchor).attr("href"), SOURCE_URL).href,
            });
          });
      });
  });

  return links;
}

function latestPerDepartmentSemester(links) {
  const latest = new Map();
  links.forEach((link) => {
    const key = `${link.department}|${link.semester}`;
    const existing = latest.get(key);
    if (!existing || existing.batch < link.batch) latest.set(key, link);
  });
  return [...latest.values()].sort(
    (a, b) => a.department.localeCompare(b.department) || a.semester - b.semester
  );
}

function extractCourses(text) {
  const lines = text.split(/\n+/).map(clean).filter(Boolean);
  const courses = [];
  const codePattern = "[A-Z]{2,5}[A-Z0-9]*\\d{3}[A-ZxX]?";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^(BMS|Vision|Mission|Program|Scheme|Note|Course Outcomes|Module|Text Books|Reference)/i.test(line)) continue;

    const codes = [...line.matchAll(new RegExp(`\\b${codePattern}\\b`, "g"))].map((match) => match[0]);
    codes.forEach((code) => {
      if (courses.some((course) => course.code === code) || /DIP|NCMC/i.test(code)) return;

      const titleParts = [];
      const tail = line.slice(line.indexOf(code) + code.length).trim();
      if (tail && !/^TD:|^PSB:|^\d/.test(tail)) titleParts.push(tail);

      for (let nextIndex = index + 1; nextIndex < Math.min(lines.length, index + 6); nextIndex += 1) {
        const next = lines[nextIndex];
        if (new RegExp(`\\b${codePattern}\\b`).test(next) || /^\d+\s/.test(next) || /^Total\b/i.test(next)) break;
        if (/^(TD:|PSB:|Any Department|NSS Coordinator|Physical Education|Yoga Teacher|Music Teacher|NCC Coordinator)/i.test(next)) break;
        if (/\b(TD|PSB):/i.test(next)) {
          titleParts.push(next.replace(/\b(TD|PSB):.*$/i, "").trim());
          break;
        }
        titleParts.push(next);
      }

      const title = clean(titleParts.join(" ")).replace(/\bTD:.*$/i, "").slice(0, 140).trim();
      if (title.length >= 3) courses.push({ code, title });
    });
  }

  return courses.filter((course, index, all) => all.findIndex((item) => item.code === course.code) === index);
}

async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const html = await (await fetch(SOURCE_URL)).text();
  const allLinks = latestPerDepartmentSemester(extractSyllabusLinks(html));
  // Filter to only semesters 1, 2, 5, 6, 7, 8 (skip 3 and 4)
  const selectedLinks = allLinks.filter((link) => [1, 2, 5, 6, 7, 8].includes(link.semester));
  const catalog = {
    source: SOURCE_URL,
    scrapedAt: new Date().toISOString(),
    selection: "Latest available syllabus PDF per department and semester",
    departments: {},
  };

  for (const [index, link] of selectedLinks.entries()) {
    process.stderr.write(`\n[${index + 1}/${selectedLinks.length}] ${link.department} sem ${link.semester} (${link.batch})`);
    catalog.departments[link.department] ??= { semesters: {} };

    try {
      const data = await pdfParse(await fetchBuffer(link.pdf));
      const courses = extractCourses(data.text);
      catalog.departments[link.department].semesters[link.semester] = { batch: link.batch, pdf: link.pdf, courses };
      process.stderr.write(` courses=${courses.length}`);
    } catch (error) {
      catalog.departments[link.department].semesters[link.semester] = {
        batch: link.batch,
        pdf: link.pdf,
        error: error instanceof Error ? error.message : "PDF parse failed",
        courses: [],
      };
      process.stderr.write(" parse-failed");
    }
  }

  await mkdir("src/data", { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`);
  process.stderr.write(`\nWrote ${OUTPUT_PATH}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
