import { NextRequest, NextResponse } from "next/server";

type ExecuteRequest = {
  code: string;
  language?: "sql" | "javascript";
};

// Helper function to parse table columns, handling nested parentheses
function parseTableColumns(str: string): string[] {
  const columns: string[] = [];
  let current = "";
  let parenDepth = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === "(") {
      parenDepth++;
      current += char;
    } else if (char === ")") {
      parenDepth--;
      current += char;
    } else if (char === "," && parenDepth === 0) {
      if (current.trim()) {
        columns.push(current.trim());
      }
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    columns.push(current.trim());
  }

  return columns;
}

export type { ExecuteRequest };

export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json();
    const { code, language = "sql" } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    if (language === "sql") {
      return validateAndAnalyzeSql(code);
    } else if (language === "javascript") {
      return executeJavaScript(code);
    } else {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function validateAndAnalyzeSql(code: string) {
  try {
    const statements = code
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (statements.length === 0) {
      return NextResponse.json({ error: "No SQL statements found" }, { status: 400 });
    }

    const results = [];
    const output: string[] = [];
    let hasErrors = false;

    for (const statement of statements) {
      const validation = validateSqlStatement(statement);

      if (validation.valid) {
        output.push(`✓ ${validation.type}`);
        if (validation.details) {
          output.push(`  ${validation.details}`);
        }
        results.push({
          success: true,
          statement: statement.substring(0, 60),
          type: validation.type,
          details: validation.details,
        });
      } else {
        output.push(`✗ Syntax Error`);
        output.push(`  Line: ${validation.error}`);
        output.push(`  Statement: ${statement.substring(0, 60)}...`);
        hasErrors = true;
        results.push({
          success: false,
          statement: statement.substring(0, 60),
          error: validation.error,
        });
      }
    }

    return NextResponse.json({
      language: "sql",
      success: !hasErrors,
      results: results,
      output: output,
      hasErrors: hasErrors,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "SQL analysis failed" },
      { status: 500 }
    );
  }
}

function validateSqlStatement(statement: string) {
  const trimmed = statement.trim().toUpperCase();

  // Check for empty statement
  if (!trimmed) {
    return { valid: false, error: "Empty statement" };
  }

  // Validate CREATE TABLE
  if (trimmed.startsWith("CREATE TABLE")) {
    const match = statement.match(/CREATE\s+TABLE\s+(\w+)\s*\((.*)\)/is);
    if (!match) {
      return { valid: false, error: "Invalid CREATE TABLE syntax. Expected: CREATE TABLE table_name (...)" };
    }

    const tableName = match[1];
    const columnsStr = match[2];

    // Parse columns handling nested parentheses
    const columns = parseTableColumns(columnsStr);
    if (columns.length === 0) {
      return { valid: false, error: "CREATE TABLE requires at least one column" };
    }

    // Extract actual columns (not constraints)
    const columnDefs = columns
      .filter((c) => {
        const colUpper = c.toUpperCase();
        return !(
          colUpper.includes("PRIMARY KEY") ||
          colUpper.includes("FOREIGN KEY") ||
          colUpper.includes("UNIQUE") ||
          colUpper.includes("CHECK")
        );
      })
      .map((c) => {
        const trimmed = c.trim();
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) {
          // Return "columnName TYPE"
          return `${parts[0]} ${parts.slice(1).join(" ")}`;
        }
        return parts[0];
      })
      .filter((c) => c);

    return {
      valid: true,
      type: "CREATE TABLE",
      details: `Table "${tableName}" with columns: ${columnDefs.join(", ")}`,
      columns: columnDefs,
    };
  }

  // Validate INSERT
  if (trimmed.startsWith("INSERT")) {
    const match = statement.match(/INSERT\s+INTO\s+(\w+)\s*(?:\((.*?)\))?\s*VALUES\s*\((.*?)\)/is);
    if (!match) {
      return {
        valid: false,
        error: "Invalid INSERT syntax. Expected: INSERT INTO table_name (columns) VALUES (...)",
      };
    }

    const tableName = match[1];
    const columns = match[2] ? match[2].split(",").length : 0;
    const values = match[3] ? match[3].split(",").length : 0;

    if (columns > 0 && columns !== values) {
      return {
        valid: false,
        error: `Column count (${columns}) does not match value count (${values})`,
      };
    }

    return { valid: true, type: "INSERT", details: `Inserting into table "${tableName}"` };
  }

  // Validate SELECT
  if (trimmed.startsWith("SELECT")) {
    const match = statement.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)/is);
    if (!match) {
      return { valid: false, error: "Invalid SELECT syntax. Expected: SELECT columns FROM table_name" };
    }

    const columns = match[1].trim();
    const tableName = match[2];

    if (!columns || columns === "*") {
      return { valid: true, type: "SELECT", details: `Query from table "${tableName}": all columns` };
    }

    const colList = columns.split(",").map((c) => c.trim());
    return {
      valid: true,
      type: "SELECT",
      details: `Query from table "${tableName}": ${colList.join(", ")}`,
    };
  }

  // Validate UPDATE
  if (trimmed.startsWith("UPDATE")) {
    const match = statement.match(/UPDATE\s+(\w+)\s+SET\s+(.*?)\s+WHERE/is);
    if (!match) {
      return {
        valid: false,
        error: "Invalid UPDATE syntax. Expected: UPDATE table_name SET column=value WHERE condition",
      };
    }

    const tableName = match[1];
    return { valid: true, type: "UPDATE", details: `Updating table "${tableName}"` };
  }

  // Validate DELETE
  if (trimmed.startsWith("DELETE")) {
    const match = statement.match(/DELETE\s+FROM\s+(\w+)/is);
    if (!match) {
      return { valid: false, error: "Invalid DELETE syntax. Expected: DELETE FROM table_name WHERE condition" };
    }

    const tableName = match[1];
    return { valid: true, type: "DELETE", details: `Deleting from table "${tableName}"` };
  }

  // Validate ALTER TABLE
  if (trimmed.startsWith("ALTER TABLE")) {
    const match = statement.match(/ALTER\s+TABLE\s+(\w+)\s+(ADD|DROP|MODIFY)/is);
    if (!match) {
      return {
        valid: false,
        error: "Invalid ALTER TABLE syntax. Expected: ALTER TABLE table_name ADD/DROP/MODIFY ...",
      };
    }

    const tableName = match[1];
    const action = match[2].toUpperCase();
    return { valid: true, type: "ALTER TABLE", details: `${action} on table "${tableName}"` };
  }

  // Unknown statement
  const firstWord = trimmed.split(/\s+/)[0];
  return {
    valid: false,
    error: `Unknown or unsupported SQL statement: "${firstWord}"`,
  };
}

function executeJavaScript(code: string) {
  try {
    const output: string[] = [];

    const mockConsole = {
      log: (...args: any[]) => {
        output.push(args.map((a) => JSON.stringify(a)).join(" "));
      },
      error: (...args: any[]) => {
        output.push("ERROR: " + args.map((a) => JSON.stringify(a)).join(" "));
      },
    };

    const fn = new Function("console", code);
    fn(mockConsole);

    return NextResponse.json({
      language: "javascript",
      success: true,
      output: output,
    });
  } catch (error) {
    return NextResponse.json(
      {
        language: "javascript",
        success: false,
        error: error instanceof Error ? error.message : "Execution failed",
      },
      { status: 400 }
    );
  }
}
