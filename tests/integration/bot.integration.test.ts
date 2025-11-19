/**
 * Интеграционные тесты для бота
 * Проверяем взаимодействие разных компонентов системы
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { User } from "../../src/types/index.js";

// Мокаем все внешние зависимости
vi.mock("../../src/utils/logger.js", () => ({
	logger: {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
		debug: vi.fn(),
	},
}));

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
						{
							time: "12:20-13:50",
							subject: "Физика",
							room: "102",
							teacher: "Иванов Иван Иванович",
							type: "Практическое занятие",
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

describe("Bot Integration Tests", () => {
	describe("Student Journey", () => {
		it("должен получить расписание студента на день", async () => {
			// Arrange
			const { getScheduleForUser, formatScheduleText } = await import(
				"../../src/services/scheduleService.js"
			);

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
			expect(schedule).toHaveLength(2);

			// Форматируем расписание
			const formatted = formatScheduleText(schedule!, student);
			expect(formatted).toContain("Математика");
			expect(formatted).toContain("Физика");
		});

		it("должен получить все факультеты и группы", async () => {
			// Arrange
			const { getFaculties, getGroupsForFaculty } = await import(
				"../../src/services/scheduleService.js"
			);

			// Act
			const faculties = getFaculties();
			const groups = getGroupsForFaculty("Тестовый факультет");

			// Assert
			expect(faculties).toContain("Тестовый факультет");
			expect(groups).toContain("TEST-101");
		});
	});

	describe("Teacher Journey", () => {
		it("должен получить расписание преподавателя на день", async () => {
			// Arrange
			const { getScheduleForUser, formatScheduleText } = await import(
				"../../src/services/scheduleService.js"
			);

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

			// Форматируем расписание
			const formatted = formatScheduleText(schedule!, teacher);
			expect(formatted).toContain("Математика");
			expect(formatted).toContain("TEST-101");
		});

		it("должен получить список всех преподавателей", async () => {
			// Arrange
			const { getTeachers } = await import(
				"../../src/services/scheduleService.js"
			);

			// Act
			const teachers = getTeachers();

			// Assert
			expect(teachers).toContain("Тестов Тест Тестович");
		});
	});

	describe("Schedule Formatting Integration", () => {
		it("должен корректно форматировать расписание студента на неделю", async () => {
			// Arrange
			const { formatScheduleForWeek } = await import(
				"../../src/canvas/format_text_functions.js"
			);

			const student: User = {
				user_id: "123",
				role: "student",
				faculty: "Тестовый факультет",
				group_or_name: "TEST-101",
				settings: {
					schedule_on_picture: false,
				},
			};

			const weekDates = ["2025-11-15"];

			// Act
			const formatted = formatScheduleForWeek(student, weekDates);

			// Assert
			expect(formatted).toContain("Математика");
			expect(formatted).toContain("📅");
		});

		it("должен обрабатывать несколько дней недели", async () => {
			// Arrange
			const { formatScheduleForWeek } = await import(
				"../../src/canvas/format_text_functions.js"
			);

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
			const formatted = formatScheduleForWeek(student, [
				"2025-11-15",
				"2025-11-16",
			]);

			// Assert
			expect(formatted).toBeDefined();
			expect(typeof formatted).toBe("string");
		});
	});

	describe("Date Utilities Integration", () => {
		it("должен корректно работать с датами недели", async () => {
			// Arrange
			const { getWeekDates, getDayIndex } = await import(
				"../../src/utils/date.js"
			);

			// Act
			const dates = getWeekDates(0);

			// Assert
			expect(dates).toHaveLength(6);
			expect(getDayIndex(dates[0])).toBe(1); // Понедельник
			expect(getDayIndex(dates[5])).toBe(6); // Суббота
		});

		it("должен работать форматирование дат с расписанием", async () => {
			// Arrange
			const { formatDate } = await import("../../src/utils/date.js");
			const { getScheduleForUser } = await import(
				"../../src/services/scheduleService.js"
			);

			const student: User = {
				user_id: "123",
				role: "student",
				faculty: "Тестовый факультет",
				group_or_name: "TEST-101",
				settings: {
					schedule_on_picture: false,
				},
			};

			const date = new Date("2025-11-15T10:00:00");

			// Act
			const dateString = formatDate(date);
			const schedule = getScheduleForUser(student, dateString);

			// Assert
			expect(schedule).toBeDefined();
			expect(schedule).toHaveLength(2);
		});
	});

	describe("Error Handling Integration", () => {
		it("должен корректно обрабатывать отсутствие расписания", async () => {
			// Arrange
			const { getScheduleForUser, formatScheduleText } = await import(
				"../../src/services/scheduleService.js"
			);

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

		it("должен возвращать сообщение при отсутствии пар", async () => {
			// Arrange
			const { formatScheduleForDay } = await import(
				"../../src/canvas/format_text_functions.js"
			);

			// Act
			const result = formatScheduleForDay("NONEXISTENT-999", "2025-11-15");

			// Assert
			expect(result).toBe("Пар на этот день нет.");
		});
	});
});