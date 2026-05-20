"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, FileText, Play, RotateCcw, Terminal, Loader, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import type { CampusCourse } from "@/features/learning-engine/sample-content";
import type { TopicNode } from "@/types/learning";

const Editor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-slate-400">Loading editor...</div>,
});

type ConceptWorkspaceProps = {
  course: CampusCourse;
  module: CampusCourse["modules"][number];
  topic: TopicNode;
};

type WorkspaceProblem = { line: number; type: string; message: string };
type WorkspaceTable = {
  name: string;
  columns: Array<{ name: string; type: string; primaryKey?: boolean; notNull?: boolean }>;
  rows?: Record<string, unknown>[];
};

type WorkspaceCopy = {
  title: string;
  difficulty: string;
  description: string;
  plainMeaning: string;
  rules: string[];
  steps: string[];
  example: string;
  misconception: string;
  task: string;
  codeTitle: string;
  code: string;
  output: string[];
  needsEditor: boolean;
  language: "sql" | "javascript";
  animationFrames: string[];
  visual: {
    source: string;
    branches: string[];
    results: string[];
  };
};

function includesAny(value: string, terms: string[]) {
  const source = value.toLowerCase();
  return terms.some((term) => source.includes(term));
}

function getWorkspaceMode(course: CampusCourse, module: CampusCourse["modules"][number], topic: TopicNode) {
  const source = `${course.slug} ${course.code} ${course.title} ${module.title} ${topic.title}`.toLowerCase();

  if (course.slug === "dbms" || includesAny(source, ["database", "sql", "normalization", "transaction"])) {
    return { needsEditor: true, language: "sql" as const };
  }

  if (
    includesAny(source, [
      "programming",
      "python",
      "java",
      "javascript",
      "c programming",
      "c++",
      "data structure",
      "algorithm",
      "machine learning",
      "web",
      "software",
      "computer networks",
      "operating system",
      "compiler",
      "iot",
      "embedded",
      "microcontroller",
    ])
  ) {
    return { needsEditor: true, language: "javascript" as const };
  }

  return { needsEditor: false, language: "javascript" as const };
}

function getProgrammingLesson(topic: TopicNode, course: CampusCourse, module: CampusCourse["modules"][number]) {
  if (includesAny(topic.title, ["class", "object"])) {
    return {
      plainMeaning:
        "A class is a blueprint. An object is one real thing created from that blueprint. If Student is a class, Sanika, Rahul, and Aisha can be separate Student objects with their own data.",
      steps: [
        "First identify the real-world thing you want to model.",
        "List the data that thing must remember, such as name, id, balance, marks, or speed.",
        "List the actions that thing can perform, such as display, update, calculate, start, or stop.",
        "Put the data and actions together inside a class.",
        "Create objects from the class and call their actions.",
      ],
      example:
        "For a college app, a Student class can store USN, name, semester, and CGPA. Each student record on the screen is one object made from that class.",
      misconception:
        "Do not think of a class as the actual data. The class is the plan; objects are the actual data created from that plan.",
    };
  }

  return {
    plainMeaning: `${topic.title} is a concept from ${course.code} that helps you understand ${module.title} by turning a broad syllabus point into a smaller idea you can explain, trace, and apply.`,
    steps: [
      "Read the name of the topic and define it in one sentence.",
      "Find the input or situation where the topic appears.",
      "Trace what changes step by step.",
      "Connect the result to one lab problem, exam question, or project use case.",
    ],
    example: `In ${course.title}, ${topic.title} can be studied by taking one small case from ${module.title} and explaining what happens before and after the concept is applied.`,
    misconception: "Do not jump straight to syntax or formulas. First know what problem the concept solves.",
  };
}

function getConceptCopy(course: CampusCourse, module: CampusCourse["modules"][number], topic: TopicNode): WorkspaceCopy {
  const mode = getWorkspaceMode(course, module, topic);

  if (course.slug === "dbms") {
    return {
      title: topic.title === "1NF" ? "First Normal Form" : topic.title,
      difficulty: topic.status === "complete" ? "Review" : "Concept",
      description:
        topic.title === "1NF"
          ? "Convert a table with repeated or multi-valued cells into rows where every attribute value is atomic."
          : "Understand the concept through a focused college example, visual trace, and implementation-style steps.",
      plainMeaning:
        topic.title === "1NF"
          ? "First Normal Form means every cell in a table stores one value. A cell like 'DBMS, OS, CN' is not atomic; it must be split into separate rows."
          : "Database design concepts help you store facts once, retrieve them reliably, and avoid inconsistent updates.",
      rules: [
        "Every cell should hold one value, not a list",
        "Repeated groups are moved into separate rows",
        "A stable key keeps each fact identifiable",
      ],
      steps: [
        "Find the table that stores repeated or mixed values.",
        "Identify the stable key for the main entity.",
        "Move repeated values into a separate relation.",
        "Check that each row now stores one clean fact.",
      ],
      example: "Student(id, name, courses) becomes Student(id, name) and Enrollment(student_id, course_code).",
      misconception: "Normalization is not just splitting tables randomly. Every split should remove duplication or make one fact live in one place.",
      task: "Transform Student(id, name, courses) into Student and Enrollment relations.",
      codeTitle: "normalization.sql",
      code: "CREATE TABLE student (\n  id INT PRIMARY KEY,\n  name TEXT NOT NULL\n);\n\nCREATE TABLE enrollment (\n  student_id INT REFERENCES student(id),\n  course_code TEXT NOT NULL,\n  PRIMARY KEY (student_id, course_code)\n);",
      output: ["Repeated group detected: courses", "Created Enrollment relation", "All attributes are atomic"],
      needsEditor: true,
      language: "sql",
      animationFrames: ["Find repeating course values", "Split them into Enrollment rows", "Validate atomic columns"],
      visual: {
        source: "Unnormalized table",
        branches: ["Student details", "Repeated courses"],
        results: ["Student table", "Enrollment table"],
      },
    };
  }

  const compactName = topic.title.replace(/[^A-Za-z0-9]/g, "") || "Topic";
  const lesson = getProgrammingLesson(topic, course, module);
  const code = mode.language === "sql"
    ? `CREATE TABLE concept_check (\n  id INTEGER PRIMARY KEY,\n  topic TEXT NOT NULL,\n  observation TEXT NOT NULL\n);\n\nINSERT INTO concept_check (topic, observation)\nVALUES ('${topic.title.replace(/'/g, "''")}', 'mapped to a working data model');\n\nSELECT * FROM concept_check;`
    : `const topic = ${JSON.stringify(topic.title)};\nconst moduleName = ${JSON.stringify(module.title)};\n\nfunction buildLearningPath(name) {\n  return [\n    \"define the concept\",\n    \"trace one worked example\",\n    \"test the idea with a small case\",\n  ].map((step, index) => ({ step: index + 1, name, action: step }));\n}\n\nconsole.log(buildLearningPath(topic));`;

  return {
    title: topic.title,
    difficulty: mode.needsEditor ? "Practice" : "Visual",
    description: mode.needsEditor
      ? `Learn ${topic.title} first, then use a small runnable check to confirm the idea.`
      : `Learn ${topic.title} through a visual sequence before moving to practice or exam problems.`,
    plainMeaning: lesson.plainMeaning,
    rules: mode.needsEditor
      ? ["Understand the idea before writing code", "Use code only to test the concept", "Explain the output in words after running it"]
      : ["Start with the real use case", "Follow the idea through the animation frames", "Summarize the rule in your own words"],
    steps: lesson.steps,
    example: lesson.example,
    misconception: lesson.misconception,
    task: mode.needsEditor
      ? `After the explanation makes sense, run or edit the practice snippet to demonstrate ${topic.title}.`
      : `Trace the animation for ${topic.title}, then explain how it supports ${module.title}.`,
    codeTitle: mode.language === "sql" ? `${compactName.toLowerCase()}.sql` : `${compactName || "concept"}.js`,
    code,
    output: ["Concept loaded", "Trace ready", "Workspace prepared"],
    needsEditor: mode.needsEditor,
    language: mode.language,
    animationFrames: [
      `Problem: ${module.title} feels broad`,
      `Concept: ${topic.title} gives one smaller idea`,
      "Break it into definition, parts, and behavior",
      "Use one example to prove you understood it",
    ],
    visual: includesAny(topic.title, ["class", "object"])
      ? {
          source: "Class blueprint",
          branches: ["Properties: USN, name, CGPA", "Methods: display, update, calculate"],
          results: ["studentOne object", "studentTwo object"],
        }
      : {
          source: topic.title,
          branches: ["Definition", "Parts", "Behavior"],
          results: ["Worked example", "Practice check"],
        },
  };
}

function VisualExplanation({ copy }: { copy: WorkspaceCopy }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-black p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Visual explanation</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{copy.title}</h3>
        </div>
        <span className="rounded-md border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-200">
          Animated flow
        </span>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_auto_1.1fr_auto_1fr]">
        <div className="concept-visual-card concept-visual-source">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Start</p>
          <p className="mt-3 text-xl font-semibold text-white">{copy.visual.source}</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">{copy.plainMeaning}</p>
        </div>

        <div className="hidden items-center xl:flex">
          <div className="concept-flow-line" />
        </div>

        <div className="grid gap-3">
          {copy.visual.branches.map((branch, index) => (
            <div key={branch} className="concept-visual-card concept-visual-branch" style={{ animationDelay: `${index * 180}ms` }}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Breakdown {index + 1}</p>
              <p className="mt-2 font-semibold text-slate-100">{branch}</p>
            </div>
          ))}
        </div>

        <div className="hidden items-center xl:flex">
          <div className="concept-flow-line" />
        </div>

        <div className="grid gap-3">
          {copy.visual.results.map((result, index) => (
            <div key={result} className="concept-visual-card concept-visual-result" style={{ animationDelay: `${360 + index * 180}ms` }}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Result {index + 1}</p>
              <p className="mt-2 font-semibold text-white">{result}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function parseStructuredOutput(line: string) {
  try {
    const parsed = JSON.parse(line);
    return Array.isArray(parsed) || (parsed && typeof parsed === "object") ? parsed : null;
  } catch {
    return null;
  }
}

function OutputRenderer({ output, compact = false }: { output: string[]; compact?: boolean }) {
  if (output.length === 0) {
    return <p className="text-slate-500">Click "Run" to execute your practice check.</p>;
  }

  return (
    <div className="space-y-3">
      {output.map((line, lineIndex) => {
        const parsed = parseStructuredOutput(line);

        if (Array.isArray(parsed)) {
          return (
            <div key={`${line}-${lineIndex}`} className="space-y-2">
              {parsed.map((item, itemIndex) => (
                <div key={itemIndex} className="rounded-md border border-slate-800 bg-black p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                    Step {typeof item?.step === "number" ? item.step : itemIndex + 1}
                  </p>
                  <p className="mt-2 font-semibold text-white">{String(item?.name ?? "Practice checkpoint")}</p>
                  <p className="mt-2 leading-6 text-slate-300">{String(item?.action ?? JSON.stringify(item, null, 2))}</p>
                </div>
              ))}
            </div>
          );
        }

        if (parsed && typeof parsed === "object") {
          return (
            <pre key={`${line}-${lineIndex}`} className="whitespace-pre-wrap rounded-md border border-slate-800 bg-black p-4 font-mono text-sm leading-6 text-slate-200">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          );
        }

        return (
          <div key={`${line}-${lineIndex}`} className={`rounded-md border border-slate-800 bg-black ${compact ? "p-3 text-xs" : "p-4 text-sm"} leading-6 text-slate-200`}>
            {line}
          </div>
        );
      })}
    </div>
  );
}

export function ConceptWorkspace({ course, module, topic }: ConceptWorkspaceProps) {
  const [tab, setTab] = useState<"description" | "explanation" | "output">("description");
  const [rightTab, setRightTab] = useState<"walkthrough" | "visual" | "practice">("walkthrough");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [problems, setProblems] = useState<WorkspaceProblem[]>([]);
  const [tables, setTables] = useState<WorkspaceTable[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [outputTab, setOutputTab] = useState<"run" | "problems" | "tables">("run");
  const copy = getConceptCopy(course, module, topic);
  const language = copy.language;

  // Initialize code on mount
  const [codeInitialized, setCodeInitialized] = useState(false);
  if (!codeInitialized) {
    setCode(copy.code);
    setCodeInitialized(true);
  }

  const handleRun = async () => {
    if (!code.trim()) {
      setOutput(["Error: No code to execute"]);
      setTab("output");
      setOutputTab("run");
      return;
    }

    setIsExecuting(true);
    setTab("output");
    setOutputTab("run");

    try {
      const response = await fetch("/api/code-execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const result = await response.json();
      const errorMessage = result.error || (!response.ok ? "Execution failed" : "");

      setProblems(
        result.success
          ? []
          : [{ line: 0, type: result.errorType || "Error", message: errorMessage }]
      );
      setTables(Array.isArray(result.tables) ? result.tables : []);
      setOutput(
        result.success
          ? result.output?.length
            ? result.output
            : ["Execution completed successfully."]
          : [`${result.errorType || "Error"}: ${errorMessage}`]
      );
    } catch (error) {
      setOutput([`Error: ${error instanceof Error ? error.message : "Execution failed"}`]);
      setProblems([{ line: 0, type: "Error", message: error instanceof Error ? error.message : "Execution failed" }]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = () => {
    setCode(copy.code);
    setOutput([]);
    setProblems([]);
    setTables([]);
  };

  const handleComplete = () => {
    setIsCompleted(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-slate-900 bg-black">
        <div className="mx-auto flex h-[88px] max-w-none items-center justify-between px-5">
          <div className="flex items-center gap-5">
            <Link href={`/courses/${course.slug}`} className="rounded-md p-2 text-slate-500 hover:bg-slate-900 hover:text-white" aria-label="Back">
              <ArrowLeft size={22} />
            </Link>
            <div>
              <h1 className="max-w-[240px] text-lg font-semibold leading-7">{copy.title}</h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{course.code} · {module.title}</p>
            </div>
            <span className="rounded-md border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-300">
              {copy.difficulty}
            </span>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => setTab("description")}
              className={tab === "description" ? "concept-tab-active" : "concept-tab"}
            >
              <FileText size={18} /> Description
            </button>
            <button
              type="button"
              onClick={() => setTab("explanation")}
              className={tab === "explanation" ? "concept-tab-active" : "concept-tab"}
            >
              <BookOpen size={18} /> Topic Explanation
            </button>
            {copy.needsEditor ? (
              <button type="button" onClick={() => setTab("output")} className={tab === "output" ? "concept-tab-active" : "concept-tab"}>
                <Terminal size={18} /> Output
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-88px)] grid-cols-1 lg:grid-cols-[43%_57%]">
        <section className="border-r border-slate-900 bg-[#070707]">
          <div className="mx-auto max-w-3xl px-8 py-12">
            {tab === "description" ? (
              <div>
                <h2 className="text-3xl font-semibold">{copy.title}</h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">{copy.plainMeaning}</p>
                <div className="mt-8 rounded-lg border border-emerald-900/60 bg-emerald-950/15 p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">Why this matters</p>
                  <p className="mt-3 leading-7 text-slate-300">{copy.description}</p>
                </div>
                <div className="mt-10">
                  <h3 className="border-b border-slate-800 pb-3 text-xl font-semibold">Step by Step</h3>
                  <ol className="mt-5 space-y-4 text-slate-300">
                    {copy.steps.map((step, index) => (
                      <li key={step} className="flex gap-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sky-500/15 text-sm font-bold text-sky-300">
                          {index + 1}
                        </span>
                        <span className="pt-1 leading-7">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="mt-10">
                  <h3 className="border-b border-slate-800 pb-3 text-xl font-semibold">Remember</h3>
                  <ul className="mt-4 space-y-4 text-slate-400">
                    {copy.rules.map((rule) => (
                      <li key={rule} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10">
                  <h3 className="border-b border-slate-800 pb-3 text-xl font-semibold">Example</h3>
                  <p className="mt-4 text-lg leading-8 text-slate-300">{copy.example}</p>
                  <p className="mt-5 rounded-lg border border-amber-900/50 bg-amber-950/10 p-4 leading-7 text-amber-100/80">
                    {copy.misconception}
                  </p>
                </div>
              </div>
            ) : null}

            {tab === "explanation" ? (
              <div>
                <h2 className="text-3xl font-semibold">Topic Explanation</h2>
                <p className="mt-6 text-lg leading-8 text-slate-400">
                  Read the idea like a lesson first. The right side shows the concept as a flow; the editor appears only as practice when code helps you test the idea.
                </p>
                <div className="mt-8 rounded-lg border border-slate-800 bg-black p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">Real system lens</p>
                  <p className="mt-3 leading-7 text-slate-400">{module.realWorldUse}</p>
                </div>
                <div className="mt-8 rounded-lg border border-sky-900/70 bg-sky-950/20 p-5">
                  <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-sky-300">
                    <Workflow size={16} /> Animated explanation
                  </p>
                  <div className="mt-5 space-y-3">
                    {copy.animationFrames.map((frame, index) => (
                      <div
                        key={frame}
                        className="flex items-center gap-4 rounded-md border border-slate-800 bg-black/60 p-4"
                        style={{ animation: `pulse 2.8s ease-in-out ${index * 0.18}s infinite` }}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-500/15 text-sm font-bold text-sky-300">
                          {index + 1}
                        </span>
                        <span className="leading-6 text-slate-300">{frame}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "output" ? (
              <div>
                <div className="mb-4 flex gap-2 border-b border-slate-800">
                  <button
                    onClick={() => setOutputTab("run")}
                    className={`pb-3 px-2 font-semibold text-sm transition ${
                      outputTab === "run"
                        ? "border-b-2 border-emerald-400 text-emerald-400"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Run Output
                  </button>
                  <button
                    onClick={() => setOutputTab("problems")}
                    className={`pb-3 px-2 font-semibold text-sm transition ${
                      outputTab === "problems"
                        ? "border-b-2 border-emerald-400 text-emerald-400"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Problems {problems.length > 0 && <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs">{problems.length}</span>}
                  </button>
                  <button
                    onClick={() => setOutputTab("tables")}
                    className={`pb-3 px-2 font-semibold text-sm transition ${
                      outputTab === "tables"
                        ? "border-b-2 border-emerald-400 text-emerald-400"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Tables {tables.length > 0 && <span className="ml-2 rounded-full bg-emerald-600 px-2 py-0.5 text-xs">{tables.length}</span>}
                  </button>
                </div>

                {outputTab === "run" ? (
                  <div className="rounded-md border border-slate-800 bg-black p-4">
                    {course.slug === "dbms" ? (
                      output.length === 0 ? (
                        <p className="text-slate-500">Click "Run" to execute your code.</p>
                      ) : (
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-6 text-slate-200">{output.join("\n")}</pre>
                      )
                    ) : <OutputRenderer output={output} />}
                  </div>
                ) : null}

                {outputTab === "problems" ? (
                  <div className="space-y-2">
                    {problems.length === 0 ? (
                      <div className="flex items-center gap-3 rounded-md border border-slate-800 bg-black p-4 text-slate-500">
                        No problems detected. Click "Run" to validate your code.
                      </div>
                    ) : (
                      problems.map((problem, idx) => (
                        <div key={idx} className="rounded-md border border-red-800 bg-red-950 p-3 text-red-300">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 pt-1 font-bold">⚠</span>
                            <div className="flex-1">
                              <p className="font-semibold">{problem.type}</p>
                              <p className="text-sm mt-1 text-red-200">{problem.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}

                {outputTab === "tables" ? (
                  <div className="space-y-4">
                    {tables.length === 0 ? (
                      <div className="flex items-center gap-3 rounded-md border border-slate-800 bg-black p-4 text-slate-500">
                        No valid tables created. Fix any errors and run again.
                      </div>
                    ) : (
                      tables.map((table, idx) => (
                        <div key={idx} className="rounded-md border border-emerald-800 bg-emerald-950 p-4 text-emerald-300">
                          <h3 className="font-bold text-lg mb-3">{table.name}</h3>
                          <div className="space-y-2">
                            {table.columns.map((col, colIdx) => (
                              <div key={colIdx} className="flex items-center gap-2 text-sm bg-black/30 p-2 rounded">
                                <span className="font-mono text-emerald-400">{col.name}</span>
                                <span className="text-slate-500">·</span>
                                <span className="font-mono text-slate-400">{col.type}</span>
                                {col.primaryKey ? <span className="rounded bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-200">PK</span> : null}
                                {col.notNull ? <span className="rounded bg-sky-400/10 px-2 py-0.5 text-xs text-sky-200">NOT NULL</span> : null}
                              </div>
                            ))}
                          </div>
                          {table.rows?.length ? (
                            <div className="mt-4 overflow-x-auto">
                              <table className="w-full border-collapse text-left text-sm">
                                <thead className="text-slate-400">
                                  <tr>
                                    {table.columns.map((column) => (
                                      <th key={column.name} className="border-b border-emerald-900 px-2 py-2 font-mono">
                                        {column.name}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {table.rows.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="text-slate-300">
                                      {table.columns.map((column) => (
                                        <td key={column.name} className="border-b border-emerald-950 px-2 py-2 font-mono">
                                          {String(row[column.name] ?? "NULL")}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <section className="bg-[#1f1f1f] flex flex-col">
          <div className="flex h-16 items-center justify-between border-b border-black bg-[#0a0a0a] px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRightTab("walkthrough")}
                className={`rounded-md px-4 py-2 font-semibold transition ${
                  rightTab === "walkthrough" ? "bg-[#1f1f1f] text-white" : "text-slate-500 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                Concept walkthrough
              </button>
              <button
                type="button"
                onClick={() => setRightTab("visual")}
                className={`rounded-md px-4 py-2 font-semibold transition ${
                  rightTab === "visual" ? "bg-[#1f1f1f] text-white" : "text-slate-500 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                Visual explanation
              </button>
              {copy.needsEditor ? (
                <button
                  type="button"
                  onClick={() => setRightTab("practice")}
                  className={`rounded-md px-4 py-2 font-semibold transition ${
                    rightTab === "practice" ? "bg-[#1f1f1f] text-white" : "text-slate-500 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  Practice
                </button>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <span className={`hidden text-sm font-semibold md:inline ${isCompleted ? "text-emerald-300" : "text-slate-500"}`}>
                {isCompleted ? "Concept Complete" : "Workspace Ready"}
              </span>
              <Button size="sm" onClick={handleComplete} disabled={isCompleted}>
                <Check size={16} /> {isCompleted ? "Completed" : "Complete"}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-1 flex-col overflow-y-auto bg-[#111] p-6">
            {rightTab === "visual" ? <VisualExplanation copy={copy} /> : null}

            {rightTab === "walkthrough" ? (
            <div className="grid gap-4">
              {copy.animationFrames.map((frame, index) => (
                <div
                  key={frame}
                  className="relative overflow-hidden rounded-lg border border-slate-800 bg-black p-5"
                >
                  <div
                    className="absolute inset-y-0 left-0 w-1 bg-sky-400"
                    style={{ animation: `pulse 2.8s ease-in-out ${index * 0.2}s infinite` }}
                  />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Frame {index + 1}</p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">{frame}</h3>
                  <p className="mt-3 leading-7 text-slate-400">
                    {index === 0
                      ? copy.plainMeaning
                      : index === 1
                        ? copy.example
                        : index === 2
                          ? copy.steps[index - 1] ?? copy.task
                          : copy.task}
                  </p>
                </div>
              ))}
            </div>
            ) : null}

            {copy.needsEditor && rightTab === "practice" ? (
              <div className="overflow-hidden rounded-lg border border-slate-800 bg-[#1b1b1b]">
                <div className="flex min-h-16 items-center justify-between border-b border-black bg-[#0a0a0a] px-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Practice only after learning</p>
                    <p className="mt-1 text-sm font-semibold text-slate-400">{copy.codeTitle}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={handleReset} disabled={isExecuting}>
                      <RotateCcw size={16} />
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleRun} disabled={isExecuting}>
                      {isExecuting ? (
                        <>
                          <Loader size={16} className="animate-spin" /> Running
                        </>
                      ) : (
                        <>
                          <Play size={16} /> Run
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="h-[320px]">
              <Editor
                height="100%"
                defaultLanguage={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'Monaco', 'Courier New', monospace",
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
              />
                </div>

            {output.length > 0 && (
              <div className="border-t border-black bg-[#0a0a0a] overflow-y-auto" style={{maxHeight: "300px"}}>
                <div className="px-4 py-3 border-b border-slate-800">
                  <h3 className="font-semibold text-sm text-slate-300">Execution Output</h3>
                </div>
                <div className="p-4 space-y-2">
                  <div className="mb-4 flex gap-2 border-b border-slate-800 pb-3">
                    <button
                      onClick={() => setOutputTab("run")}
                      className={`pb-2 px-2 font-semibold text-sm transition ${
                        outputTab === "run"
                          ? "border-b-2 border-emerald-400 text-emerald-400"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Run Output
                    </button>
                    <button
                      onClick={() => setOutputTab("problems")}
                      className={`pb-2 px-2 font-semibold text-sm transition ${
                        outputTab === "problems"
                          ? "border-b-2 border-emerald-400 text-emerald-400"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Problems {problems.length > 0 && <span className="ml-1 rounded-full bg-red-600 px-1.5 py-0 text-xs">{problems.length}</span>}
                    </button>
                    <button
                      onClick={() => setOutputTab("tables")}
                      className={`pb-2 px-2 font-semibold text-sm transition ${
                        outputTab === "tables"
                          ? "border-b-2 border-emerald-400 text-emerald-400"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Tables {tables.length > 0 && <span className="ml-1 rounded-full bg-emerald-600 px-1.5 py-0 text-xs">{tables.length}</span>}
                    </button>
                  </div>

                  {outputTab === "run" && (
                    course.slug === "dbms" ? (
                      <pre className="whitespace-pre-wrap rounded-md border border-slate-800 bg-black p-3 font-mono text-xs leading-5 text-slate-200">
                        {output.join("\n")}
                      </pre>
                    ) : <OutputRenderer output={output} compact />
                  )}

                  {outputTab === "problems" && (
                    <div className="space-y-2">
                      {problems.length === 0 ? (
                        <div className="text-xs text-emerald-400">✓ No errors</div>
                      ) : (
                        problems.map((problem, idx) => (
                          <div key={idx} className="rounded-md border border-red-800 bg-red-950 p-2 text-red-300 text-xs">
                            <p className="font-semibold">{problem.type}</p>
                            <p className="mt-1 text-red-200">{problem.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {outputTab === "tables" && (
                    <div className="space-y-3">
                      {tables.length === 0 ? (
                        <div className="text-xs text-slate-500">No tables created</div>
                      ) : (
                        tables.map((table, idx) => (
                          <div key={idx} className="rounded-md border border-emerald-800 bg-emerald-950/30 p-2 text-emerald-300 text-xs">
                            <h4 className="font-bold mb-2">{table.name}</h4>
                            <div className="space-y-1">
                              {table.columns.map((col, colIdx) => (
                                <div key={colIdx} className="flex items-center gap-2">
                                  <span className="font-mono text-emerald-400">{col.name}</span>
                                  <span className="text-slate-600">·</span>
                                    <span className="font-mono text-slate-400">{col.type}</span>
                                    {col.primaryKey ? <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 text-[10px] text-emerald-200">PK</span> : null}
                                  </div>
                                ))}
                              </div>
                              {table.rows?.length ? (
                                <div className="mt-3 overflow-x-auto">
                                  <table className="w-full text-left">
                                    <thead className="text-slate-500">
                                      <tr>
                                        {table.columns.map((column) => (
                                          <th key={column.name} className="border-b border-slate-800 py-1 pr-3 font-mono">
                                            {column.name}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {table.rows.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                          {table.columns.map((column) => (
                                            <td key={column.name} className="border-b border-slate-900 py-1 pr-3 font-mono text-slate-300">
                                              {String(row[column.name] ?? "NULL")}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : null}
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
