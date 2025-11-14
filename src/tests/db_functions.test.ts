import { describe, it, expect, beforeEach } from "vitest";
import { saveUser, getUser, deleteUser } from "../db/db_functions.ts";

describe("DB functions", () => {
	const userId = 99999;

	beforeEach(() => {
		deleteUser(userId);
	});

	it("сохраняет и получает пользователя", () => {
		saveUser(userId, "student", "TEST_GROUP");
		const user = getUser(userId);
		expect(user).toBeDefined();
		expect(user.group_or_name).toBe("TEST_GROUP");
		expect(user.role).toBe("student");
	});

	it("удаляет пользователя", () => {
		saveUser(userId, "student", "TEST_GROUP");
		deleteUser(userId);
		const user = getUser(userId);
		expect(user).toBeUndefined();
	});
});
