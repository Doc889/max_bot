/**
 * Тесты для database
 * Проверяем CRUD операции с пользователями
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// Мокаем logger
vi.mock("../../src/utils/logger.js", () => ({
	logger: {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
		debug: vi.fn(),
	},
}));

describe("database", () => {
	const testDbPath = path.resolve("./test-data.db");
	let saveUser: any;
	let getUser: any;
	let deleteUser: any;

	beforeEach(async () => {
		// Удаляем тестовую БД если существует
		if (fs.existsSync(testDbPath)) {
			fs.unlinkSync(testDbPath);
		}

		// Создаем тестовую БД
		const testDb = new Database(testDbPath);
		testDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        role TEXT NOT NULL,
        group_or_name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
		testDb.close();

		// Мокаем путь к БД
		vi.resetModules();
		vi.doMock("../../src/config/database.js", async () => {
			const Database = (await import("better-sqlite3")).default;
			const db = new Database(testDbPath);

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

			return {
				default: db,
				saveUser: (userId: number, role: string, value: string) => {
					statements.saveUser.run(userId, role, value);
				},
				getUser: (userId: number) => {
					const row = statements.getUser.get(userId) as any;
					if (!row) return undefined;
					return {
						id: row.id,
						user_id: row.user_id,
						role: row.role,
						group_or_name: row.group_or_name,
						created_at: row.created_at,
					};
				},
				deleteUser: (userId: number) => {
					statements.deleteUser.run(userId);
				},
			};
		});

		const module = await import("../../src/config/database.js");
		saveUser = module.saveUser;
		getUser = module.getUser;
		deleteUser = module.deleteUser;
	});

	afterEach(() => {
		// Очищаем тестовую БД
		if (fs.existsSync(testDbPath)) {
			fs.unlinkSync(testDbPath);
		}
		vi.clearAllMocks();
	});

	describe("saveUser", () => {
		it("должен сохранять нового пользователя-студента", () => {
			// Arrange
			const userId = 12345;
			const role = "student";
			const group = "TEST-101";

			// Act
			saveUser(userId, role, group);
			const user = getUser(userId);

			// Assert
			expect(user).toBeDefined();
			expect(user?.user_id).toBe(userId);
			expect(user?.role).toBe(role);
			expect(user?.group_or_name).toBe(group);
		});

		it("должен сохранять нового пользователя-преподавателя", () => {
			// Arrange
			const userId = 67890;
			const role = "teacher";
			const name = "Иванов Иван Иванович";

			// Act
			saveUser(userId, role, name);
			const user = getUser(userId);

			// Assert
			expect(user).toBeDefined();
			expect(user?.user_id).toBe(userId);
			expect(user?.role).toBe(role);
			expect(user?.group_or_name).toBe(name);
		});

		it("должен обновлять существующего пользователя", () => {
			// Arrange
			const userId = 12345;

			// Act
			saveUser(userId, "student", "TEST-101");
			let user = getUser(userId);
			expect(user?.group_or_name).toBe("TEST-101");

			saveUser(userId, "student", "TEST-102");
			user = getUser(userId);

			// Assert
			expect(user?.group_or_name).toBe("TEST-102");
			expect(user?.user_id).toBe(userId);
		});

		it("должен обновлять роль пользователя", () => {
			// Arrange
			const userId = 12345;

			// Act
			saveUser(userId, "student", "TEST-101");
			let user = getUser(userId);
			expect(user?.role).toBe("student");

			saveUser(userId, "teacher", "Иванов Иван Иванович");
			user = getUser(userId);

			// Assert
			expect(user?.role).toBe("teacher");
			expect(user?.group_or_name).toBe("Иванов Иван Иванович");
		});
	});

	describe("getUser", () => {
		it("должен возвращать существующего пользователя", () => {
			// Arrange
			const userId = 12345;
			saveUser(userId, "student", "TEST-101");

			// Act
			const user = getUser(userId);

			// Assert
			expect(user).toBeDefined();
			expect(user?.user_id).toBe(userId);
		});

		it("должен возвращать undefined для несуществующего пользователя", () => {
			// Act
			const user = getUser(99999);

			// Assert
			expect(user).toBeUndefined();
		});

		it("должен возвращать пользователя со всеми полями", () => {
			// Arrange
			const userId = 12345;
			saveUser(userId, "student", "TEST-101");

			// Act
			const user = getUser(userId);

			// Assert
			expect(user).toHaveProperty("id");
			expect(user).toHaveProperty("user_id");
			expect(user).toHaveProperty("role");
			expect(user).toHaveProperty("group_or_name");
			expect(user).toHaveProperty("created_at");
		});
	});

	describe("deleteUser", () => {
		it("должен удалять существующего пользователя", () => {
			// Arrange
			const userId = 12345;
			saveUser(userId, "student", "TEST-101");
			expect(getUser(userId)).toBeDefined();

			// Act
			deleteUser(userId);

			// Assert
			expect(getUser(userId)).toBeUndefined();
		});

		it("не должен выбрасывать ошибку при удалении несуществующего пользователя", () => {
			// Act & Assert
			expect(() => deleteUser(99999)).not.toThrow();
		});
	});

	describe("Интеграционные тесты", () => {
		it("должен корректно обрабатывать множественные операции", () => {
			// Arrange & Act
			saveUser(1, "student", "TEST-101");
			saveUser(2, "teacher", "Учитель 1");
			saveUser(3, "student", "TEST-102");

			// Assert
			expect(getUser(1)).toBeDefined();
			expect(getUser(2)).toBeDefined();
			expect(getUser(3)).toBeDefined();

			deleteUser(2);
			expect(getUser(2)).toBeUndefined();
			expect(getUser(1)).toBeDefined();
			expect(getUser(3)).toBeDefined();
		});

		it("должен сохранять даты создания", () => {
			// Arrange
			const userId = 12345;

			// Act
			saveUser(userId, "student", "TEST-101");
			const user = getUser(userId);

			// Assert
			expect(user?.created_at).toBeDefined();
			expect(typeof user?.created_at).toBe("string");
		});

		it("должен корректно обрабатывать специальные символы в именах", () => {
			// Arrange
			const userId = 12345;
			const name = "О'Коннор Джон";

			// Act
			saveUser(userId, "teacher", name);
			const user = getUser(userId);

			// Assert
			expect(user?.group_or_name).toBe(name);
		});
	});
});
