/**
 * Фикстуры для тестирования пользователей
 */

import type { User } from "../../src/types/index.js";

export const createTestStudent = (overrides?: Partial<User>): User => {
	return {
		id: 1,
		user_id: 123,
		role: "student",
		group_or_name: "TEST-101",
		created_at: new Date().toISOString(),
		...overrides,
	};
};

export const createTestTeacher = (overrides?: Partial<User>): User => {
	return {
		id: 2,
		user_id: 456,
		role: "teacher",
		group_or_name: "Тестов Тест Тестович",
		created_at: new Date().toISOString(),
		...overrides,
	};
};