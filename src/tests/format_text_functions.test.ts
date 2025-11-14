import { describe, it, expect, vi } from "vitest";

// Мокаем schedule.json перед импортом модуля
vi.mock("../schedule/schedule.json", () => ({
	default: {
		faculties: {
			FAC: {
				"X-01": {
					"2025-11-10": [
						{
							subject: "Алгоритмы",
							time: "09:00",
							teacher: "Иванов",
							room: "201",
							type: "Практика",
						},
					],
				},
			},
		},
		teachers: {},
	},
}));

import {
	formatScheduleForDay,
	formatScheduleForWeek,
} from "../canvas/format_text_functions";

describe("formatScheduleForDay", () => {
	it("формирует строку расписания для студента", () => {
		const res = formatScheduleForDay("X-01", "2025-11-10");
		expect(res).toContain("Алгоритмы");
	});

	it("возвращает сообщение об отсутствии пар", () => {
		const res = formatScheduleForDay("X-01", "2025-11-11");
		expect(res.toLowerCase()).toMatch(/пар на этот день нет/);
	});
});

describe("formatScheduleForWeek", () => {
	const user = { role: "student", group_or_name: "X-01" };
	const weekDates = ["2025-11-10", "2025-11-11"];

	it("формирует строку расписания на неделю", () => {
		const res = formatScheduleForWeek(user, weekDates);
		expect(res).toContain("Алгоритмы");
		expect(res).toMatch(/📅/);
	});
});
