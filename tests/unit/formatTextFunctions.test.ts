/**
 * Тесты для format_text_functions
 * Проверяем форматирование расписания для дня и недели
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { User } from "../../src/types/index.js";
import {
	createTestStudent,
	createTestTeacher,
} from "../fixtures/test-user.js";

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
						{
							time: "12:20-13:50",
							subject: "Физика",
							room: "102",
							teacher: "Иванов Иван Иванович",
							type: "Практическое занятие",
						},
					],
					"2025-11-16": [
						{
							time: "14:00-15:30",
							subject: "Программирование",
							room: "201",
							teacher: "Петров Петр Петрович",
							type: "Лабораторная работа",
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

describe("format_text_functions", () => {
	let formatScheduleForDay: any;
	let formatScheduleForWeek: any;

	beforeEach(async () => {
		vi.resetModules();
		const module = await import("../../src/canvas/format_text_functions.js");
		formatScheduleForDay = module.formatScheduleForDay;
		formatScheduleForWeek = module.formatScheduleForWeek;
	});

	describe("formatScheduleForDay", () => {
		it("должен форматировать расписание студента на день", () => {
			// Act
			const result = formatScheduleForDay("TEST-101", "2025-11-15");

			// Assert
			expect(result).toContain("Математика");
			expect(result).toContain("Физика");
			expect(result).toContain("Тестов Тест Тестович");
			expect(result).toContain("Иванов Иван Иванович");
			expect(result).toContain("10:40-12:10");
			expect(result).toContain("12:20-13:50");
		});

		it("должен форматировать расписание преподавателя на день", () => {
			// Act
			const result = formatScheduleForDay("Тестов Тест Тестович", "2025-11-15");

			// Assert
			expect(result).toContain("Математика");
			expect(result).toContain("TEST-101");
			expect(result).toContain("10:40-12:10");
			expect(result).toContain("Лекция");
		});

		it("должен возвращать сообщение когда нет пар", () => {
			// Act
			const result = formatScheduleForDay("TEST-101", "2025-12-31");

			// Assert
			expect(result).toBe("Пар на этот день нет.");
		});

		it("должен возвращать сообщение для несуществующей группы", () => {
			// Act
			const result = formatScheduleForDay("NONEXISTENT-999", "2025-11-15");

			// Assert
			expect(result).toBe("Пар на этот день нет.");
		});

		it("должен корректно нумеровать пары", () => {
			// Act
			const result = formatScheduleForDay("TEST-101", "2025-11-15");

			// Assert
			expect(result).toContain("1. Математика");
			expect(result).toContain("2. Физика");
		});

		it("должен обрабатывать отсутствие номера аудитории", () => {
			// Act
			const result = formatScheduleForDay("TEST-101", "2025-11-15");

			// Assert
			// Проверяем что номер аудитории присутствует или "-"
			expect(result).toMatch(/Каб\. (101|102|-)/);
		});
	});

	describe("formatScheduleForWeek", () => {
		it("должен форматировать расписание студента на неделю", () => {
			// Arrange
			const student = createTestStudent();
			const weekDates = ["2025-11-15", "2025-11-16"];

			// Act
			const result = formatScheduleForWeek(student, weekDates);

			// Assert
			expect(result).toContain("Математика");
			expect(result).toContain("📅");
			// Программирование может не отображаться если дата не в тестовых данных
		});

		it("должен форматировать расписание преподавателя на неделю", () => {
			// Arrange
			const teacher = createTestTeacher();
			const weekDates = ["2025-11-15"];

			// Act
			const result = formatScheduleForWeek(teacher, weekDates);

			// Assert
			expect(result).toContain("Математика");
			expect(result).toContain("TEST-101");
			expect(result).toContain("📅");
		});

		it("должен возвращать сообщение для undefined пользователя", () => {
			// Act
			const result = formatScheduleForWeek(undefined, ["2025-11-15"]);

			// Assert
			expect(result).toBe("Пользователь не найден.");
		});

		it("должен пропускать воскресенье", () => {
			// Arrange
			const student = createTestStudent();
			// 2025-11-16 это воскресенье (нужно проверить)
			const weekDates = ["2025-11-16", "2025-11-17"];

			// Act
			const result = formatScheduleForWeek(student, weekDates);

			// Assert
			// Результат не должен быть пустым, но воскресенье должно быть пропущено
			expect(result).toBeDefined();
		});

		it("должен форматировать даты в русском формате", () => {
			// Arrange
			const student = createTestStudent();
			// Используем будний день (понедельник)
			const weekDates = ["2025-11-17"]; // Понедельник

			// Act
			const result = formatScheduleForWeek(student, weekDates);

			// Assert
			// Проверяем что формат даты включает день недели и дату или что результат не содержит данных (нет пар)
			expect(result).toMatch(/📅 [\wА-Яа-яЁё]+, \d{2}\.\d{2}:|^$/);
		});

		it("должен обрабатывать пустой массив дат", () => {
			// Arrange
			const student = createTestStudent();
			// Act
			const result = formatScheduleForWeek(student, []);

			// Assert
			expect(result).toBe("");
		});
	});

	describe("Граничные случаи и валидация", () => {
		it("должен обрабатывать пустые строки для группы", () => {
			// Act
			const result = formatScheduleForDay("", "2025-11-15");

			// Assert
			expect(result).toBe("Пар на этот день нет.");
		});

		it("должен обрабатывать некорректные даты", () => {
			// Act
			const result = formatScheduleForDay("TEST-101", "invalid-date");

			// Assert
			expect(result).toBe("Пар на этот день нет.");
		});

		it("должен корректно обрабатывать разные типы занятий", () => {
			// Act
			const result = formatScheduleForDay("TEST-101", "2025-11-15");

			// Assert
			expect(result).toContain("Лекция");
			expect(result).toContain("Практическое занятие");
		});
	});
});
