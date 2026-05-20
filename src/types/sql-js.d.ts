declare module "sql.js" {
  export type QueryExecResult = {
    columns: string[];
    values: unknown[][];
  };

  export class Database {
    exec(sql: string): QueryExecResult[];
    close(): void;
  }

  export type SqlJsStatic = {
    Database: typeof Database;
  };

  export default function initSqlJs(config?: { wasmBinary?: Buffer }): Promise<SqlJsStatic>;
}
