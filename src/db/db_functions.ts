import Database from "better-sqlite3";

const db = new Database("data.db");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  role TEXT NOT NULL, -- 'student' или 'teacher'
  group_or_name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

export function saveUser(
	userId: number,
	role: "student" | "teacher",
	value: string,
) {
	const stmt = db.prepare(`
    INSERT INTO users (user_id, role, group_or_name)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      role=excluded.role,
      group_or_name=excluded.group_or_name;
  `);
	stmt.run(userId, role, value);
}

export function getUser(userId: number) {
	const stmt = db.prepare("SELECT * FROM users WHERE user_id = ?");
	return stmt.get(userId);
}

export function deleteUser(userId: number) {
	const stmt = db.prepare("DELETE FROM users WHERE user_id = ?");
	stmt.run(userId);
}

export default db;
