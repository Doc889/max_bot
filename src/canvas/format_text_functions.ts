import { loadSchedule } from "../config/scheduleLoader.js";
import type { Lesson, TeacherLesson, User } from "../types/index.js";

const scheduleData = loadSchedule();

export function formatScheduleForDay(userNameOrGroup: string, date: string) {
	let lessons: (Lesson | TeacherLesson)[] = [];

	let foundAsStudent = false;
	for (const faculty of Object.values(scheduleData.faculties)) {
		const groupSchedule = faculty[userNameOrGroup];
		if (groupSchedule?.[date]) {
			lessons = groupSchedule[date];
			foundAsStudent = true;
			break;
		}
	}

	if (!foundAsStudent) {
		if (scheduleData.teachers[userNameOrGroup]) {
			const teacherSchedule = scheduleData.teachers[userNameOrGroup];
			if (teacherSchedule[date]) {
				lessons = teacherSchedule[date];
			}
		}
	}

	if (!lessons || lessons.length === 0) {
		return "Пар на этот день нет.";
	}

	const formattedLessons: string[] = [];

	for (let i = 0; i < lessons.length; i++) {
		const lesson = lessons[i];
		let line = "";

		if (lesson.group) {
			line += `${i + 1}. ${lesson.subject}\n`;
			line += `${lesson.type || "Лекция"}\n`;
			line += `Группа: ${lesson.group}\n`;
			line += `${lesson.room || "-"}\n`;
			line += `${lesson.time}`;
		} else {
			line += `**${i + 1}. ${lesson.subject}**\n`;
			line += ` *${lesson.type || "Лекция"}*\n`;
			line += ` ${lesson.teacher || "Преподаватель неизвестен"}\n`;
			line += `Каб. ${lesson.room || "-"}\n`;
			line += `*${lesson.time}*`;
		}

		formattedLessons.push(line);
	}

	return formattedLessons.join("\n\n");
}

export function formatScheduleForWeek(
	user: User | undefined,
	weekDates: string[],
) {
	if (!user) return "Пользователь не найден.";

	let result = "";

	for (const date of weekDates) {
		const dateNew = new Date(date);

		if (dateNew.getUTCDay() === 0) continue;

		let daySchedule = "";

		if (user.role === "student") {
			daySchedule = formatScheduleForDay(user.group_or_name, date);
		} else if (user.role === "teacher") {
			daySchedule = formatScheduleForDay(user.group_or_name, date);
		}

		const weekday = new Intl.DateTimeFormat("ru-RU", {
			weekday: "long",
		}).format(dateNew);

		const day = dateNew.getDate().toString().padStart(2, "0");
		const month = (dateNew.getMonth() + 1).toString().padStart(2, "0");

		const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
		const formattedDate = `${formattedWeekday}, ${day}.${month}`;

		result += `📅 ${formattedDate}:\n${daySchedule}\n\n`;
	}

	return result.trim();
}
