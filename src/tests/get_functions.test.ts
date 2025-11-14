import { describe, it, expect, vi } from "vitest";

// Мокаем schedule.json перед импортом функций
vi.mock("../schedule/schedule.json", () => ({
	default: {
		faculties: {
			TEST_FAC: {
				"G-01": {
					"2025-11-10": [
						{
							subject: "Тестовый предмет",
							time: "10:00-11:00",
							teacher: "Петров",
							room: "101",
							type: "Лекция",
						},
					],
				},
			},
		},
		teachers: {
			Петров: {
				"2025-11-10": [
					{
						subject: "Тестовый предмет",
						time: "10:00-11:00",
						group: "G-01",
						room: "101",
						type: "Лекция",
					},
				],
			},
		},
	},
}));

import { getScheduleForUser } from "../schedule/get_functions.ts";

describe("getScheduleForUser — dynamic schedule", () => {
	const student = { role: "student", group_or_name: "G-01" };
	const teacher = { role: "teacher", group_or_name: "Петров" };

	it("возвращает расписание студента", () => {
		const res = getScheduleForUser(student, "2025-11-10");
		expect(res).toContain("Тестовый предмет");
	});

	it("возвращает 'нет расписания' при отсутствии данных", () => {
		const res = getScheduleForUser(student, "2025-11-11");
		expect(res.toLowerCase()).toMatch(/нет/);
	});

	it("возвращает расписание преподавателя", () => {
		const res = getScheduleForUser(teacher, "2025-11-10");
		expect(res).toContain("Тестовый предмет");
	});
});
