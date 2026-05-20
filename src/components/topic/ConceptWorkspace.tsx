"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, FileText, Play, RotateCcw, Terminal, Loader } from "lucide-react";
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

function getConceptCopy(courseSlug: string, topic: TopicNode) {
  if (courseSlug === "dbms") {
    return {
      title: topic.title === "1NF" ? "First Normal Form" : topic.title,
      difficulty: topic.status === "complete" ? "Review" : "Concept",
      description:
        topic.title === "1NF"
          ? "Convert a table with repeated or multi-valued cells into rows where every attribute value is atomic."
          : "Understand the concept through a focused college example, visual trace, and implementation-style steps.",
      rules: [
        "Every cell should hold one value, not a list",
        "Repeated groups are moved into separate rows",
        "A stable key keeps each fact identifiable",
      ],
      task: "Transform Student(id, name, courses) into Student and Enrollment relations.",
      codeTitle: "normalization.sql",
      code: "CREATE TABLE student (\n  id INT PRIMARY KEY,\n  name TEXT NOT NULL\n);\n\nCREATE TABLE enrollment (\n  student_id INT REFERENCES student(id),\n  course_code TEXT NOT NULL,\n  PRIMARY KEY (student_id, course_code)\n);",
      output: ["Repeated group detected: courses", "Created Enrollment relation", "All attributes are atomic"],
    };
  }

  return {
    title: topic.title,
    difficulty: "Concept",
    description: "Work through the idea using a practical college-engineering scenario and a guided workspace.",
    rules: ["Read the system behavior", "Trace the transformation", "Complete the concept checkpoint"],
    task: `Explain where ${topic.title} appears in a real system and complete the guided transformation.`,
    codeTitle: "workspace.ts",
    code: `function understand${topic.title.replace(/[^A-Za-z0-9]/g, "")}() {\n  // Trace the concept with a real input\n  return \"concept mapped\";\n}`,
    output: ["Concept loaded", "Trace ready", "Workspace prepared"],
  };
}

export function ConceptWorkspace({ course, module, topic }: ConceptWorkspaceProps) {
  const [tab, setTab] = useState<"description" | "explanation" | "output">("description");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [problems, setProblems] = useState<WorkspaceProblem[]>([]);
  const [tables, setTables] = useState<WorkspaceTable[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [outputTab, setOutputTab] = useState<"run" | "problems" | "tables">("run");
  const copy = getConceptCopy(course.slug, topic);
  const language = course.slug === "dbms" ? "sql" : "javascript";

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
            <button type="button" onClick={() => setTab("output")} className={tab === "output" ? "concept-tab-active" : "concept-tab"}>
              <Terminal size={18} /> Output
            </button>
          </div>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-88px)] grid-cols-1 lg:grid-cols-[43%_57%]">
        <section className="border-r border-slate-900 bg-[#070707]">
          <div className="mx-auto max-w-3xl px-8 py-12">
            {tab === "description" ? (
              <div>
                <h2 className="text-3xl font-semibold">{copy.title}</h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">{copy.description}</p>
                <div className="mt-12">
                  <h3 className="border-b border-slate-800 pb-3 text-xl font-semibold">Rules</h3>
                  <ul className="mt-4 space-y-4 text-slate-400">
                    {copy.rules.map((rule) => (
                      <li key={rule} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-12">
                  <h3 className="border-b border-slate-800 pb-3 text-xl font-semibold">Concept Task</h3>
                  <p className="mt-4 text-lg leading-8 text-slate-400">{copy.task}</p>
                </div>
              </div>
            ) : null}

            {tab === "explanation" ? (
              <div>
                <h2 className="text-3xl font-semibold">Topic Explanation</h2>
                <p className="mt-6 text-lg leading-8 text-slate-400">
                  CampusLabs treats this as a concept workspace. Read the real-system behavior, inspect the transformation on the right, then mark the concept complete when it clicks.
                </p>
                <div className="mt-8 rounded-lg border border-slate-800 bg-black p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">Real system lens</p>
                  <p className="mt-3 leading-7 text-slate-400">{module.realWorldUse}</p>
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
                    {output.length === 0 ? (
                      <p className="text-slate-500">Click "Run" to execute your code.</p>
                    ) : (
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-6 text-slate-200">{output.join("\n")}</pre>
                    )}
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
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-[#1f1f1f] px-4 py-2 font-semibold">{copy.codeTitle}</span>
              <span className="text-sm font-semibold text-slate-600">concept-notes.md</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`hidden text-sm font-semibold md:inline ${isCompleted ? "text-emerald-300" : "text-slate-500"}`}>
                {isCompleted ? "Concept Complete" : "Workspace Ready"}
              </span>
              <Button variant="secondary" size="sm" onClick={handleReset} disabled={isExecuting}>
                <RotateCcw size={16} />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRun}
                disabled={isExecuting}
              >
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
              <Button size="sm" onClick={handleComplete} disabled={isCompleted}>
                <Check size={16} /> {isCompleted ? "Completed" : "Complete"}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className={`${output.length > 0 ? "flex-1" : "flex-1"} bg-[#1b1b1b] overflow-hidden`}>
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
                    <pre className="whitespace-pre-wrap rounded-md border border-slate-800 bg-black p-3 font-mono text-xs leading-5 text-slate-200">
                      {output.join("\n")}
                    </pre>
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
        </section>
      </main>
    </div>
  );
}
