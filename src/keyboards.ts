import { Keyboard } from "@maxhub/max-bot-api";
import { loadSchedule } from "./config/scheduleLoader.js";

const scheduleData = loadSchedule();

export const mainKeyboard = Keyboard.inlineKeyboard([
	[
		Keyboard.button.callback("🔽 Сегодня", "today"),
		Keyboard.button.callback("⏩ Завтра", "tomorrow"),
	],
	[
		Keyboard.button.callback("⏮ Эта неделя", "this_week"),
		Keyboard.button.callback("⏭ След. неделя", "next_week"),
	],
	[Keyboard.button.callback("⚙️ Настройки", "settings")],
]);

export function keyboardWithPhoto(
	context: "today" | "tomorrow" | "this_week" | "next_week",
) {
	return Keyboard.inlineKeyboard([
		[
			Keyboard.button.callback("🔽 Сегодня", "today"),
			Keyboard.button.callback("⏩ Завтра", "tomorrow"),
		],
		[
			Keyboard.button.callback("⏮ Эта неделя", "this_week"),
			Keyboard.button.callback("⏭ След. неделя", "next_week"),
		],
		[Keyboard.button.callback("Картинкой", `picture_${context}`)],
		[Keyboard.button.callback("⚙️ Настройки", "settings")],
	]);
}

export const teacherStudentKeyboard = Keyboard.inlineKeyboard([
	[
		Keyboard.button.callback("Студент", "student"),
		Keyboard.button.callback("Преподаватель", "teacher"),
	],
]);

const faculties = Object.keys(scheduleData.faculties);
export const facultiesKeyboard = Keyboard.inlineKeyboard(
	faculties.map((faculty) => [
		Keyboard.button.callback(faculty, `faculty_${faculty}`),
	]),
);

export function groupsKeyboard(groups: string[]) {
	return Keyboard.inlineKeyboard(
		groups.map((group) => [Keyboard.button.callback(group, `group_${group}`)]),
	);
}

const teachers = Object.keys(scheduleData.teachers);
export const teacherKeyboard = Keyboard.inlineKeyboard(
	teachers.map((teacher) => [
		Keyboard.button.callback(teacher, `teacher_${teacher}`),
	]),
);
