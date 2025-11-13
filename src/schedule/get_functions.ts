import fs from "fs";
import path from "path";

const schedulePath = path.resolve("./files/schedule.json");
const scheduleData = JSON.parse(fs.readFileSync(schedulePath, "utf-8"));

export function getScheduleForUser(user: any, dateKey: string) {
	if (!user) return "Пользователь не найден";

	if (user.role === "student") {
		const group = user.group_or_name;
		const groupSchedule = scheduleData.faculties
			? Object.values(scheduleData.faculties).flatMap((faculty) =>
					faculty[group] && faculty[group][dateKey]
						? faculty[group][dateKey]
						: [],
				)
			: [];
		if (!groupSchedule.length) return "Расписание на этот день отсутствует";

		return groupSchedule
			.map((item) => `• ${item.time} — ${item.subject} (каб. ${item.room})`)
			.join("\n");
	}

	if (user.role === "teacher") {
		const teacher = user.group_or_name;
		const teacherSchedule = scheduleData.teachers[teacher]?.[dateKey] || [];
		if (!teacherSchedule.length) return "Расписание на этот день отсутствует";

		return teacherSchedule
			.map(
				(item) =>
					`• ${item.time} — ${item.subject} (группы: ${item.groups.join(", ")}, каб. ${item.room})`,
			)
			.join("\n");
	}

	return "Нет роли для показа расписания";
}

export function getWeekDates(offsetWeeks = 0) {
	const now = new Date();
	now.setDate(now.getDate() + offsetWeeks * 7);

	const day = now.getDay();
	const monday = new Date(now);
	monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));

	const weekDates: string[] = [];
	for (let i = 0; i < 7; i++) {
		const d = new Date(monday);
		d.setDate(monday.getDate() + i);
		weekDates.push(d.toISOString().slice(0, 10));
	}

	return weekDates;
}

export function getWeekSchedule(user: any, weekDates: string[]) {
	return weekDates
		.map((date) => {
			const scheduleText = getScheduleForUser(user, date);
			return `📅 ${date}:\n${scheduleText}`;
		})
		.join("\n\n");
}
