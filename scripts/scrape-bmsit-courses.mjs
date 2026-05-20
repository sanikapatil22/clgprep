import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as cheerio from "cheerio";
import pdfParse from "pdf-parse";

const SOURCE_URL = "https://bmsit.ac.in/autonomous.php";
const OUTPUT_PATH = "src/data/bmsit-course-catalog.json";
const GENERATED_COURSES_PATH = "src/features/learning-engine/generated-courses.ts";
const INCLUDED_SEMESTERS = [1, 2, 5, 6, 7, 8];

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

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function extractModules(text) {
  const normalized = text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ");
  const matches = [...normalized.matchAll(/(?:^|\n)\s*(Module|Unit)\s*[-:]?\s*([1-5IVX]+)\s*[:.-]?\s*/gi)];

  return matches.slice(0, 5).map((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? normalized.length;
    const body = clean(normalized.slice(start, end))
      .replace(/\bTeaching Hours.*$/i, "")
      .replace(/\bCourse Outcomes.*$/i, "")
      .replace(/\bText Books.*$/i, "")
      .replace(/\bReference Books.*$/i, "");
    const chunks = body
      .split(/(?:,|;|\.\s+| - |\u2022)/)
      .map((item) => clean(item))
      .filter((item) => item.length >= 4 && item.length <= 95)
      .filter((item) => !/^(RBT|L\d|CO\d|BTL|Hours|Laboratory|Practical|Text|Reference|Course)$/i.test(item))
      .slice(0, 8);
    const title = chunks[0] ?? `${match[1]} ${match[2]}`;
    const topics = (chunks.length > 1 ? chunks : [title, ...chunks]).slice(0, 6);

    return {
      slug: slugify(title) || `module-${index + 1}`,
      title,
      summary: `Build the core ideas in ${title} through short concept tasks, checks, and implementation practice.`,
      realWorldUse: `Used when applying ${title} in engineering analysis, software systems, labs, projects, and exam problem solving.`,
      topics: topics.map((topic, topicIndex) => ({
        slug: slugify(topic) || `topic-${topicIndex + 1}`,
        title: topic,
        status: topicIndex === 0 ? "active" : "locked",
        xp: 70 + topicIndex * 15,
      })),
    };
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function courseSegment(text, course, courses) {
  const codePattern = new RegExp(`\\b${escapeRegExp(course.code)}\\b`, "g");
  const starts = [...text.matchAll(codePattern)].map((match) => match.index ?? -1).filter((index) => index >= 0);
  const otherCodes = courses.filter((item) => item.code !== course.code).map((item) => escapeRegExp(item.code));
  const nextCodePattern = otherCodes.length ? new RegExp(`\\b(?:${otherCodes.join("|")})\\b`, "g") : null;

  for (const start of starts) {
    const tail = text.slice(start + course.code.length);
    if (!/\b(Module|Unit)\s*[-:]?\s*[1-5IVX]/i.test(tail.slice(0, 7000))) continue;

    let end = text.length;
    if (nextCodePattern) {
      nextCodePattern.lastIndex = start + course.code.length;
      const next = nextCodePattern.exec(text);
      if (next?.index && next.index > start) end = next.index;
    }

    return text.slice(start, end);
  }

  return "";
}

function fallbackModules(course) {
  const title = clean(course.title).replace(/\b\d+\s+\d+\s+\d+\s+\d+\b/g, "").trim() || course.code;
  const foundations = [
    `${title} foundations`,
    "Key terminology",
    "Worked examples",
    "Common mistakes",
  ];
  const applications = [
    `${title} applications`,
    "Problem patterns",
    "Implementation check",
    "Exam-style practice",
  ];

  return [foundations, applications].map((topics, index) => ({
    slug: index === 0 ? "foundations" : "applications",
    title: index === 0 ? "Foundations" : "Applications",
    summary: `Learn ${title} with guided concept notes, runnable checks, and topic-by-topic practice.`,
    realWorldUse: `Connects ${title} to department labs, mini-projects, technical interviews, and university assessment.`,
    progress: 0,
    topics: topics.map((topic, topicIndex) => ({
      slug: slugify(topic) || `topic-${topicIndex + 1}`,
      title: topic,
      status: topicIndex === 0 ? "active" : "locked",
      xp: 70 + topicIndex * 15,
    })),
  }));
}

function toDepartmentSlug(department) {
  const value = department.toLowerCase();
  if (value.includes("ai&ml") || value.includes("ai and ml") || value.includes("aiml")) return "aiml";
  if (value.includes("artificial intelligence")) return "aiml";
  if (value.includes("computer science and business")) return "csbs";
  if (value.includes("computer science")) return "cse";
  if (value.includes("information science")) return "ise";
  if (value.includes("electronics")) return "ece";
  if (value.includes("ete") || value.includes("telecommunication")) return "ete";
  if (value.includes("electrical")) return "eee";
  if (value.includes("civil")) return "civil";
  if (value.includes("mechanical")) return "mech";
  if (value.includes("master of computer")) return "mca";
  if (value.includes("business administration")) return "mba";
  return slugify(department);
}

function makeCourseSlug(course, departmentSlug, semester) {
  return slugify(`${course.code}-${departmentSlug}-sem-${semester}`);
}

function makeGeneratedCourses(catalog) {
  const courses = [];

  for (const [departmentName, department] of Object.entries(catalog.departments)) {
    const departmentSlug = toDepartmentSlug(departmentName);

    for (const [semesterText, semester] of Object.entries(department.semesters)) {
      const semesterNumber = Number(semesterText);
      if (!INCLUDED_SEMESTERS.includes(semesterNumber)) continue;

      for (const course of semester.courses ?? []) {
        const modules = course.modules?.length ? course.modules : fallbackModules(course);
        courses.push({
          slug: makeCourseSlug(course, departmentSlug, semesterNumber),
          title: course.title,
          code: course.code,
          semester: semesterNumber,
          progress: 0,
          xp: modules.reduce(
            (total, module) => total + module.topics.reduce((sum, topic) => sum + topic.xp, 0),
            0
          ),
          departmentSlugs: [departmentSlug],
          sourceLabel: "BMSIT Autonomous Scheme and Syllabus",
          sourceHref: semester.pdf,
          modules: modules.map((module, moduleIndex) => ({
            slug: module.slug || `module-${moduleIndex + 1}`,
            title: module.title,
            progress: 0,
            summary: module.summary,
            realWorldUse: module.realWorldUse,
            topics: module.topics,
          })),
        });
      }
    }
  }

  return courses;
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
  const selectedLinks = allLinks.filter((link) => INCLUDED_SEMESTERS.includes(link.semester));
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
      const extractedCourses = extractCourses(data.text);
      const courses = extractedCourses.map((course) => ({
        ...course,
        modules: extractModules(courseSegment(data.text, course, extractedCourses)).length
          ? extractModules(courseSegment(data.text, course, extractedCourses))
          : fallbackModules(course),
      }));
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
  await mkdir("src/features/learning-engine", { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`);
  await writeFile(
    GENERATED_COURSES_PATH,
    `// Auto-generated from BMSIT syllabus PDFs for semesters 1, 2, 5, 6, 7, and 8. Do not edit manually.\n` +
      `import type { CampusCourse } from "./sample-content";\n\n` +
      `export const generatedCourses: CampusCourse[] = ${JSON.stringify(makeGeneratedCourses(catalog), null, 2)};\n`
  );
  process.stderr.write(`\nWrote ${OUTPUT_PATH}\n`);
  process.stderr.write(`Wrote ${GENERATED_COURSES_PATH}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
