/**
 * Конфигурация базы данных с оптимизированными prepared statements
 */

import Database from "better-sqlite3";
import path from "path";
import type { User, UserDbRow, UserRole } from "../types/index.js";
import { logger } from "../utils/logger.js";

const dbPath = path.resolve("./data.db");
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  role TEXT NOT NULL,
  group_or_name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

logger.info("Database initialized", { path: dbPath });

const statements = {
	saveUser: db.prepare(`
    INSERT INTO users (user_id, role, group_or_name)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      role=excluded.role,
      group_or_name=excluded.group_or_name
  `),
	getUser: db.prepare("SELECT * FROM users WHERE user_id = ?"),
	deleteUser: db.prepare("DELETE FROM users WHERE user_id = ?"),
};

export function saveUser(userId: number, role: UserRole, value: string): void {
	try {
		statements.saveUser.run(userId, role, value);
		logger.info("User saved", { userId, role });
	} catch (error) {
		logger.error("Failed to save user", error);
		throw error;
	}
}

export function getUser(userId: number): User | undefined {
	try {
		const row = statements.getUser.get(userId) as UserDbRow | undefined;
		if (!row) return undefined;

		return {
			id: row.id,
			user_id: row.user_id,
			role: row.role as UserRole,
			group_or_name: row.group_or_name,
			created_at: row.created_at,
		};
	} catch (error) {
		logger.error("Failed to get user", error);
		return undefined;
	}
}

export function deleteUser(userId: number): void {
	try {
		statements.deleteUser.run(userId);
		logger.info("User deleted", { userId });
	} catch (error) {
		logger.error("Failed to delete user", error);
		throw error;
	}
}

export default db;
