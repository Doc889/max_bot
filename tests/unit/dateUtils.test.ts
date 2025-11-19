/**
 * Тесты для date utilities
 * Проверяем форматирование дат и получение дат недели
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("date utilities", () => {
	let formatDate: any;
	let getTodayString: any;
	let getWeekDates: any;
	let getDayName: any;
	let getDayIndex: any;

	beforeEach(async () => {
		vi.resetModules();
		const module = await import("../../src/utils/date.js");
		formatDate = module.formatDate;
		getTodayString = module.getTodayString;
		getWeekDates = module.getWeekDates;
		getDayName = module.getDayName;
		getDayIndex = module.getDayIndex;
	});

	describe("formatDate", () => {
		it("должен форматировать дату в YYYY-MM-DD", () => {
			// Arrange
			const date = new Date("2025-11-15T10:30:00");

			// Act
			const result = formatDate(date);

			// Assert
			expect(result).toBe("2025-11-15");
		});

		it("должен правильно форматировать дату с однозначными числами", () => {
			// Arrange
			const date = new Date("2025-01-05T10:30:00");

			// Act
			const result = formatDate(date);

			// Assert
			expect(result).toBe("2025-01-05");
		});

		it("должен возвращать строку формата DateString", () => {
			// Arrange
			const date = new Date("2025-11-15T10:30:00");

			// Act
			const result = formatDate(date);

			// Assert
			expect(typeof result).toBe("string");
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});
	});

	describe("getTodayString", () => {
		it("должен возвращать сегодняшнюю дату в формате YYYY-MM-DD", () => {
			// Act
			const result = getTodayString();
			const today = new Date().toISOString().slice(0, 10);

			// Assert
			expect(result).toBe(today);
		});

		it("должен возвращать дату в правильном формате", () => {
			// Act
			const result = getTodayString();

			// Assert
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});
	});

	describe("getWeekDates", () => {
		it("должен возвращать 6 дат для текущей недели", () => {
			// Act
			const dates = getWeekDates(0);

			// Assert
			expect(dates).toHaveLength(6);
			for (const date of dates) {
				expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			}
		});

		it("должен начинать с понедельника", () => {
			// Act
			const dates = getWeekDates(0);

			// Assert
			// Первая дата должна быть понедельником (день недели = 1)
			const firstDate = new Date(dates[0]);
			const dayOfWeek = firstDate.getDay();
			expect(dayOfWeek).toBe(1);
		});

		it("должен заканчивать субботой", () => {
			// Act
			const dates = getWeekDates(0);

			// Assert
			// Последняя дата должна быть субботой (день недели = 6)
			const lastDate = new Date(dates[5]);
			const dayOfWeek = lastDate.getDay();
			expect(dayOfWeek).toBe(6);
		});

		it("должен возвращать последовательные даты", () => {
			// Act
			const dates = getWeekDates(0);

			// Assert
			for (let i = 1; i < dates.length; i++) {
				const prevDate = new Date(dates[i - 1]);
				const currDate = new Date(dates[i]);
				const diff = currDate.getTime() - prevDate.getTime();
				const dayInMs = 24 * 60 * 60 * 1000;
				expect(diff).toBe(dayInMs);
			}
		});

		it("должен корректно обрабатывать смещение на следующую неделю", () => {
			// Act
			const thisWeek = getWeekDates(0);
			const nextWeek = getWeekDates(1);

			// Assert
			const thisWeekStart = new Date(thisWeek[0]);
			const nextWeekStart = new Date(nextWeek[0]);
			const diff = nextWeekStart.getTime() - thisWeekStart.getTime();
			const weekInMs = 7 * 24 * 60 * 60 * 1000;
			expect(diff).toBe(weekInMs);
		});

		it("должен корректно обрабатывать смещение на предыдущую неделю", () => {
			// Act
			const thisWeek = getWeekDates(0);
			const prevWeek = getWeekDates(-1);

			// Assert
			const thisWeekStart = new Date(thisWeek[0]);
			const prevWeekStart = new Date(prevWeek[0]);
			const diff = thisWeekStart.getTime() - prevWeekStart.getTime();
			const weekInMs = 7 * 24 * 60 * 60 * 1000;
			expect(diff).toBe(weekInMs);
		});
	});

	describe("getDayName", () => {
		it("должен возвращать правильные названия дней", () => {
			// Assert
			expect(getDayName(0)).toBe("Вс");
			expect(getDayName(1)).toBe("Пн");
			expect(getDayName(2)).toBe("Вт");
			expect(getDayName(3)).toBe("Ср");
			expect(getDayName(4)).toBe("Чт");
			expect(getDayName(5)).toBe("Пт");
			expect(getDayName(6)).toBe("Сб");
		});

		it("должен возвращать пустую строку для невалидного индекса", () => {
			// Assert
			expect(getDayName(7)).toBe("");
			expect(getDayName(-1)).toBe("");
			expect(getDayName(100)).toBe("");
		});
	});

	describe("getDayIndex", () => {
		it("должен возвращать правильный индекс дня недели", () => {
			// Arrange - 2025-11-17 это понедельник
			const monday = "2025-11-17";

			// Act
			const index = getDayIndex(monday);

			// Assert
			expect(index).toBe(1);
		});

		it("должен корректно обрабатывать воскресенье", () => {
			// Arrange - 2025-11-16 это воскресенье
			const sunday = "2025-11-16";

			// Act
			const index = getDayIndex(sunday);

			// Assert
			expect(index).toBe(0);
		});

		it("должен корректно обрабатывать субботу", () => {
			// Arrange - 2025-11-15 это суббота
			const saturday = "2025-11-15";

			// Act
			const index = getDayIndex(saturday);

			// Assert
			expect(index).toBe(6);
		});
	});

	describe("Интеграционные тесты", () => {
		it("должен корректно работать цикл formatDate -> getDayIndex", () => {
			// Arrange
			const date = new Date("2025-11-17T10:30:00"); // Понедельник

			// Act
			const formatted = formatDate(date);
			const dayIndex = getDayIndex(formatted);

			// Assert
			expect(dayIndex).toBe(1); // Понедельник
		});

		it("должен корректно работать getWeekDates -> getDayIndex для всей недели", () => {
			// Act
			const weekDates = getWeekDates(0);

			// Assert
			expect(getDayIndex(weekDates[0])).toBe(1); // Пн
			expect(getDayIndex(weekDates[1])).toBe(2); // Вт
			expect(getDayIndex(weekDates[2])).toBe(3); // Ср
			expect(getDayIndex(weekDates[3])).toBe(4); // Чт
			expect(getDayIndex(weekDates[4])).toBe(5); // Пт
			expect(getDayIndex(weekDates[5])).toBe(6); // Сб
		});
	});
});