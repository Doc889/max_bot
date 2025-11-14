/**
 * Утилиты для работы с датами
 */

import type { DateString } from "../types/index.js";

/**
 * Форматирует дату в строку формата YYYY-MM-DD
 */
export function formatDate(date: Date): DateString {
	return date.toISOString().slice(0, 10);
}

/**
 * Получает текущую дату в формате YYYY-MM-DD
 */
export function getTodayString(): DateString {
	return formatDate(new Date());
}

/**
 * Получает даты недели начиная с понедельника
 * @param weekOffset - смещение недели (0 = текущая, 1 = следующая, -1 = предыдущая)
 */
export function getWeekDates(weekOffset = 0): DateString[] {
	const dates: DateString[] = [];
	const now = new Date();

	for (let i = 1; i <= 6; i++) {
		const d = new Date(now);
		const dayOfWeek = d.getUTCDay();
		const diff = dayOfWeek === 0 ? i : i - dayOfWeek;
		d.setUTCDate(d.getUTCDate() + diff + weekOffset * 7);
		dates.push(formatDate(d));
	}

	return dates;
}

/**
 * Получает название дня недели по индексу (1 = Пн, 2 = Вт, ...)
 */
export function getDayName(dayIndex: number): string {
	const days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
	return days[dayIndex] || "";
}

/**
 * Получает индекс дня недели из даты (0 = Вс, 1 = Пн, ...)
 */
export function getDayIndex(dateString: DateString): number {
	return new Date(dateString).getUTCDay();
}
