/**
 * Сервис для работы с расписанием
 * Централизует логику получения расписания для студентов и преподавателей
 */

import { loadSchedule } from "../config/scheduleLoader.js";
import type {
	DateString,
	Lesson,
	TeacherLesson,
	User,
} from "../types/index.js";

/**
 * Получает расписание для пользователя на указанную дату
 */
export function getScheduleForUser(
	user: User | undefined,
	date: DateString,
): Lesson[] | TeacherLesson[] | null {
	if (!user) return null;

	const scheduleData = loadSchedule();

	if (user.role === "student") {
		for (const faculty of Object.values(scheduleData.faculties)) {
			const groupSchedule = faculty[user.group_or_name];
			if (groupSchedule && groupSchedule[date]) {
				return groupSchedule[date];
			}
		}
	} else if (user.role === "teacher") {
		const teacherSchedule = scheduleData.teachers[user.group_or_name];
		if (teacherSchedule && teacherSchedule[date]) {
			return teacherSchedule[date];
		}
	}

	return null;
}

/**
 * Получает все доступные факультеты
 */
export function getFaculties(): string[] {
	const scheduleData = loadSchedule();
	return Object.keys(scheduleData.faculties);
}

/**
 * Получает группы для факультета
 */
export function getGroupsForFaculty(facultyName: string): string[] {
	const scheduleData = loadSchedule();
	const faculty = scheduleData.faculties[facultyName];
	return faculty ? Object.keys(faculty) : [];
}

/**
 * Получает всех преподавателей
 */
export function getTeachers(): string[] {
	const scheduleData = loadSchedule();
	return Object.keys(scheduleData.teachers);
}

/**
 * Форматирует расписание в текстовый вид
 */
export function formatScheduleText(
	lessons: Lesson[] | TeacherLesson[],
	user: User,
): string {
	if (lessons.length === 0) {
		return "На этот день пар нет.";
	}

	const isTeacher = user.role === "teacher";
	let text = "";

	for (const lesson of lessons) {
		text += `\n🕐 ${lesson.time}\n`;
		text += `📚 ${lesson.subject}\n`;
		text += `🏢 Аудитория: ${lesson.room}\n`;

		if (isTeacher) {
			const tLesson = lesson as TeacherLesson;
			text += `👥 Группа: ${tLesson.group}\n`;
			text += `🎓 ${tLesson.faculty}\n`;
		} else {
			text += `👨‍🏫 ${lesson.teacher}\n`;
		}

		text += `📖 ${lesson.type}\n`;
	}

	return text;
}
