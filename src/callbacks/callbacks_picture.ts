import type { Bot } from "@maxhub/max-bot-api";
import fs from "fs";
import path from "path";
import {
	generateScheduleImage,
	generateWeekImage,
} from "../canvas/holst_generation.ts";
import { getUser } from "../config/database.js";
import { loadSchedule } from "../config/scheduleLoader.js";
import { keyboardWithPhoto } from "../keyboards.ts";

const scheduleData = loadSchedule();

export function registerCallbacksPicture(bot: Bot) {
	bot.action(
		/^picture(?:_(today|tomorrow|this_week|next_week))?$/,
		async (ctx) => {
			try {
				const userId = ctx.user?.user_id;
				const user = getUser(userId);
				if (!user) {
					return ctx.answerOnCallback({
						message: { text: "Ошибка: пользователь не найден." },
					});
				}

				const context = ctx.match[1] || "today";
				let dateStr = "";
				const now = new Date();

				switch (context) {
					case "today":
						dateStr = now.toISOString().slice(0, 10);
						break;
					case "tomorrow": {
						const tomorrow = new Date(now);
						tomorrow.setDate(now.getDate() + 1);
						dateStr = tomorrow.toISOString().slice(0, 10);
						break;
					}
					case "this_week":
					case "next_week":
						dateStr = context.replace("_", " ");
						break;
				}

				let lessons: any[] = [];

				if (context === "today" || context === "tomorrow") {
					if (user.role === "student") {
						for (const faculty of Object.values(scheduleData.faculties)) {
							const groupSchedule = (faculty as any)[user.group_or_name];
							if (groupSchedule && groupSchedule[dateStr]) {
								lessons = groupSchedule[dateStr];
								break;
							}
						}
					} else if (user.role === "teacher") {
						const teacherSchedule = scheduleData.teachers[user.group_or_name];
						if (teacherSchedule && teacherSchedule[dateStr]) {
							lessons = teacherSchedule[dateStr];
						}
					}
				} else if (context === "this_week" || context === "next_week") {
					const weekOffset = context === "this_week" ? 0 : 1;
					const weekDates = Array.from({ length: 7 }, (_, i) => {
						const d = new Date();
						d.setDate(d.getDate() - d.getDay() + i + weekOffset * 7);
						return d.toISOString().slice(0, 10);
					});

					lessons = weekDates.map((date) => {
						let dayLessons: any[] = [];
						if (user.role === "student") {
							for (const faculty of Object.values(scheduleData.faculties)) {
								const groupSchedule = (faculty as any)[user.group_or_name];
								if (groupSchedule?.[date]) {
									dayLessons = groupSchedule[date];
									break;
								}
							}
						} else if (user.role === "teacher") {
							const teacherSchedule = scheduleData.teachers[user.group_or_name];
							if (teacherSchedule && teacherSchedule[date]) {
								dayLessons = teacherSchedule[date];
							}
						}
						return { date, lessons: dayLessons };
					});
				}

				if (
					(context === "today" || context === "tomorrow") &&
					lessons.length === 0
				) {
					return ctx.answerOnCallback({
						message: { text: `📭 На ${dateStr} занятий нет.` },
					});
				}

				const tempDir = path.resolve("./src/temp");
				if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
				const filePath = path.join(
					tempDir,
					`${user.group_or_name}_${dateStr}.png`,
				);

				if (context === "today" || context === "tomorrow") {
					const buffer = generateScheduleImage(
						lessons,
						dateStr,
						user.group_or_name,
					);
					fs.writeFileSync(filePath, buffer);
				} else {
					const buffer = generateWeekImage(lessons, user.group_or_name);
					fs.writeFileSync(filePath, buffer);
				}

				const uploadedImage = await ctx.api.uploadImage({
					source: fs.readFileSync(filePath),
				});

				await ctx.reply(``, {
					attachments: [uploadedImage.toJson(), keyboardWithPhoto(context)],
				});

				fs.unlinkSync(filePath);
			} catch (error) {
				console.error("Ошибка при обработке картинки:", error);
				ctx.reply("❌ Произошла ошибка при генерации изображения.");
			}
		},
	);
}
