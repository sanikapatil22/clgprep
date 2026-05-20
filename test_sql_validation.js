// Test the SQL validation function locally
const testCases = [
  "CREATE TABLE users (id INT, name VARCHAR(255))",
  "SELEKT * FROM users",  // Invalid keyword
  "INSERT INTO users VALUES (1, 'John')",  // Missing column list
  "SELECT * FROM users WHERE id = 1",
  "UPDATE users SET name='Jane' WHERE id=1",
  "DELETE FROM users",
  "ALTER TABLE users ADD COLUMN age INT",
  "CREAT TABLE invalid (id INT)",  // Typo
  "SELECT id, name FROM users WHERE status = 'active'",
  "INSERT INTO users (id, name) VALUES (1, 'John')",
];

console.log("SQL Validation Test Cases:\n");
testCases.forEach((sql, idx) => {
  console.log(`Test ${idx + 1}: ${sql.substring(0, 50)}...`);
});
