import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "sql.js";

export const runtime = "nodejs";

const require = createRequire(import.meta.url);
const initSqlJs = require("sql.js") as (config?: { wasmBinary?: Buffer }) => Promise<{
  Database: new () => Database;
}>;

type ExecuteRequest = {
  code: string;
  language?: "sql" | "javascript";
};

type SqlColumn = {
  name: string;
  type: string;
  primaryKey: boolean;
  notNull: boolean;
};

type SqlTable = {
  name: string;
  columns: SqlColumn[];
  rows: Record<string, unknown>[];
};

export type { ExecuteRequest };

export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json();
    const { code, language = "sql" } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ language, success: false, error: "No code provided" }, { status: 400 });
    }

    if (language === "sql") {
      return executeSql(code);
    }

    if (language === "javascript") {
      return executeJavaScript(code);
    }

    return NextResponse.json({ success: false, error: "Unsupported language" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

async function executeSql(code: string) {
  try {
    const wasmBinary = readFileSync(join(process.cwd(), "node_modules/sql.js/dist/sql-wasm.wasm"));
    const SQL = await initSqlJs({ wasmBinary });
    const db = new SQL.Database();
    const resultSets = db.exec(code);
    const tables = readTables(db);

    const output: string[] = [];
    if (resultSets.length === 0) {
      output.push("SQL executed successfully.");
    }

    resultSets.forEach((set, index) => {
      output.push(`Result ${index + 1}: ${set.values.length} row${set.values.length === 1 ? "" : "s"}`);
      output.push(set.columns.join(" | "));
      set.values.forEach((row) => output.push(row.map((value) => String(value ?? "NULL")).join(" | ")));
    });

    db.close();

    return NextResponse.json({
      language: "sql",
      success: true,
      output,
      resultSets: resultSets.map((set) => ({
        columns: set.columns,
        rows: set.values.map((row) =>
          Object.fromEntries(set.columns.map((column, index) => [column, row[index] ?? null]))
        ),
      })),
      tables,
    });
  } catch (error) {
    return NextResponse.json(
      {
        language: "sql",
        success: false,
        errorType: error instanceof SyntaxError ? "Syntax Error" : "SQL Error",
        error: error instanceof Error ? error.message : "SQL execution failed",
        output: [],
        tables: [],
      },
      { status: 400 }
    );
  }
}

function readTables(db: Database): SqlTable[] {
  const tableResults = db.exec(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );
  const names = tableResults[0]?.values.map((row) => String(row[0])) ?? [];

  return names.map((name) => {
    const escapedName = name.replace(/'/g, "''");
    const columnResult = db.exec(`PRAGMA table_info('${escapedName}')`);
    const columns =
      columnResult[0]?.values.map((row) => ({
        name: String(row[1]),
        type: String(row[2] || "ANY"),
        notNull: Boolean(row[3]),
        primaryKey: Boolean(row[5]),
      })) ?? [];

    const selectResult = db.exec(`SELECT * FROM "${name.replace(/"/g, '""')}" LIMIT 25`);
    const rows =
      selectResult[0]?.values.map((row) =>
        Object.fromEntries(selectResult[0].columns.map((column, index) => [column, row[index] ?? null]))
      ) ?? [];

    return { name, columns, rows };
  });
}

function executeJavaScript(code: string) {
  try {
    const output: string[] = [];
    const mockConsole = {
      log: (...args: unknown[]) => output.push(args.map(formatConsoleValue).join(" ")),
      error: (...args: unknown[]) => output.push(`ERROR: ${args.map(formatConsoleValue).join(" ")}`),
      warn: (...args: unknown[]) => output.push(`WARN: ${args.map(formatConsoleValue).join(" ")}`),
    };

    const fn = new Function("console", code);
    const result = fn(mockConsole);
    if (result !== undefined) output.push(`Return value: ${formatConsoleValue(result)}`);

    return NextResponse.json({
      language: "javascript",
      success: true,
      output: output.length ? output : ["JavaScript executed successfully."],
    });
  } catch (error) {
    return NextResponse.json(
      {
        language: "javascript",
        success: false,
        errorType: error instanceof SyntaxError ? "Syntax Error" : "Runtime Error",
        error: error instanceof Error ? error.message : "Execution failed",
        output: [],
      },
      { status: 400 }
    );
  }
}

function formatConsoleValue(value: unknown) {
  if (typeof value === "string") return value;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  return JSON.stringify(value);
}
