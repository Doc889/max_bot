/**
 * Тесты для scheduleService
 * Проверяем получение расписания для студентов и преподавателей
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { User } from "../../src/types/index.js";

// Мокаем scheduleLoader
vi.mock("../../src/config/scheduleLoader.js", () => ({
	loadSchedule: vi.fn(() => ({
		faculties: {
			"Тестовый факультет": {
				"TEST-101": {
					"2025-11-15": [
						{
							time: "10:40-12:10",
							subject: "Математика",
							room: "101",
							teacher: "Тестов Тест Тестович",
							type: "Лекция",
						},
					],
				},
			},
		},
		teachers: {
			"Тестов Тест Тестович": {
				"2025-11-15": [
					{
						time: "10:40-12:10",
						subject: "Математика",
						room: "101",
						group: "TEST-101",
						faculty: "Тестовый факультет",
						type: "Лекция",
					},
				],
			},
		},
	})),
}));

describe("scheduleService", () => {
	let getScheduleForUser: any;
	let getFaculties: any;
	let getGroupsForFaculty: any;
	let getTeachers: any;
	let formatScheduleText: any;

	beforeEach(async () => {
		vi.resetModules();
		const module = await import("../../src/services/scheduleService.js");
		getScheduleForUser = module.getScheduleForUser;
		getFaculties = module.getFaculties;
		getGroupsForFaculty = module.getGroupsForFaculty;
		getTeachers = module.getTeachers;
		formatScheduleText = module.formatScheduleText;
	});

	describe("getScheduleForUser", () => {
		it("должен возвращать расписание для студента", () => {
			// Arrange
			const student: User = {
				user_id: "123",
				role: "student",
				faculty: "Тестовый факультет",
				group_or_name: "TEST-101",
				settings: {
					schedule_on_picture: false,
				},
			};

			// Act
			const schedule = getScheduleForUser(student, "2025-11-15");

			// Assert
			expect(schedule).toBeDefined();
			expect(schedule).toHaveLength(1);
			expect(schedule?.[0].subject).toBe("Математика");
			expect(schedule?.[0].teacher).toBe("Тестов Тест Тестович");
		});

		it("должен возвращать расписание для преподавателя", () => {
			// Arrange
			const teacher: User = {
				user_id: "456",
				role: "teacher",
				faculty: "",
				group_or_name: "Тестов Тест Тестович",
				settings: {
					schedule_on_picture: false,
				},
			};

			// Act
			const schedule = getScheduleForUser(teacher, "2025-11-15");

			// Assert
			expect(schedule).toBeDefined();
			expect(schedule).toHaveLength(1);
			const lesson = schedule?.[0] as any;
			expect(lesson.subject).toBe("Математика");
			expect(lesson.group).toBe("TEST-101");
		});

		it("должен возвращать null для несуществующей даты", () => {
			// Arrange
			const student: User = {
				user_id: "123",
				role: "student",
				faculty: "Тестовый факультет",
				group_or_name: "TEST-101",
				settings: {
					schedule_on_picture: false,
				},
			};

			// Act
			const schedule = getScheduleForUser(student, "2025-12-31");

			// Assert
			expect(schedule).toBeNull();
		});

		it("должен возвращать null для undefined пользователя", () => {
			// Act
			const schedule = getScheduleForUser(undefined, "2025-11-15");

			// Assert
			expect(schedule).toBeNull();
		});

		it("должен возвращать null для несуществующей группы", () => {
			// Arrange
			const student: User = {
				user_id: "123",
				role: "student",
				faculty: "Тестовый факультет",
				group_or_name: "NONEXISTENT-999",
				settings: {
					schedule_on_picture: false,
				},
			};

			// Act
			const schedule = getScheduleForUser(student, "2025-11-15");

			// Assert
			expect(schedule).toBeNull();
		});
	});

	describe("getFaculties", () => {
		it("должен возвращать список факультетов", () => {
			// Act
			const faculties = getFaculties();

			// Assert
			expect(faculties).toBeInstanceOf(Array);
			expect(faculties).toContain("Тестовый факультет");
			expect(faculties.length).toBeGreaterThan(0);
		});
	});

	describe("getGroupsForFaculty", () => {
		it("должен возвращать группы для существующего факультета", () => {
			// Act
			const groups = getGroupsForFaculty("Тестовый факультет");

			// Assert
			expect(groups).toBeInstanceOf(Array);
			expect(groups).toContain("TEST-101");
			expect(groups.length).toBeGreaterThan(0);
		});

		it("должен возвращать пустой массив для несуществующего факультета", () => {
			// Act
			const groups = getGroupsForFaculty("Несуществующий факультет");

			// Assert
			expect(groups).toBeInstanceOf(Array);
			expect(groups).toHaveLength(0);
		});
	});

	describe("getTeachers", () => {
		it("должен возвращать список преподавателей", () => {
			// Act
			const teachers = getTeachers();

			// Assert
			expect(teachers).toBeInstanceOf(Array);
			expect(teachers).toContain("Тестов Тест Тестович");
			expect(teachers.length).toBeGreaterThan(0);
		});
	});

	describe("formatScheduleText", () => {
		it("должен форматировать расписание студента", () => {
			// Arrange
			const lessons = [
				{
					time: "10:40-12:10",
					subject: "Математика",
					room: "101",
					teacher: "Тестов Тест Тестович",
					type: "Лекция",
				},
			];

			const student: User = {
				user_id: "123",
				role: "student",
				faculty: "Тестовый факультет",
				group_or_name: "TEST-101",
				settings: {
					schedule_on_picture: false,
				},
			};

			// Act
			const formatted = formatScheduleText(lessons, student);

			// Assert
			expect(formatted).toContain("10:40-12:10");
			expect(formatted).toContain("Математика");
			expect(formatted).toContain("101");
			expect(formatted).toContain("Тестов Тест Тестович");
			expect(formatted).toContain("Лекция");
		});

		it("должен форматировать расписание преподавателя", () => {
			// Arrange
			const lessons = [
				{
					time: "10:40-12:10",
					subject: "Математика",
					room: "101",
					teacher: "Тестов Тест Тестович",
					type: "Лекция",
					group: "TEST-101",
					faculty: "Тестовый факультет",
				},
			];

			const teacher: User = {
				user_id: "456",
				role: "teacher",
				faculty: "",
				group_or_name: "Тестов Тест Тестович",
				settings: {
					schedule_on_picture: false,
				},
			};

			// Act
			const formatted = formatScheduleText(lessons, teacher);

			// Assert
			expect(formatted).toContain("10:40-12:10");
			expect(formatted).toContain("Математика");
			expect(formatted).toContain("101");
			expect(formatted).toContain("TEST-101");
			expect(formatted).toContain("Тестовый факультет");
		});

		it("должен возвращать сообщение для пустого расписания", () => {
			// Arrange
			const student: User = {
				user_id: "123",
				role: "student",
				faculty: "Тестовый факультет",
				group_or_name: "TEST-101",
				settings: {
					schedule_on_picture: false,
				},
			};

			// Act
			const formatted = formatScheduleText([], student);

			// Assert
			expect(formatted).toBe("На этот день пар нет.");
		});
	});
});
