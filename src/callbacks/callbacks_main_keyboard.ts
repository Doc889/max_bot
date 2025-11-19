import type { Bot } from "@maxhub/max-bot-api";
import {
	formatScheduleForDay,
	formatScheduleForWeek,
} from "../canvas/format_text_functions.ts";
import { getUser } from "../config/database.js";
import { keyboardWithPhoto, mainKeyboard } from "../keyboards.ts";
import { ru_lexicon } from "../LEXICON/ru_lexicon.ts";
import { getWeekDates } from "../utils/date.js";

export function registerCallbacksMainKeyboard(bot: Bot) {
	bot.action("today", (ctx) => {
		const userId = ctx.user?.user_id;
		const user = getUser(userId);
		if (!user) return;

		const today = new Date().toISOString().slice(0, 10);
		const text = formatScheduleForDay(user.group_or_name, today);
		ctx.answerOnCallback({
			message: {
				text,
				attachments: [keyboardWithPhoto("today")],
				format: "markdown",
			},
		});
	});

	bot.action("tomorrow", (ctx) => {
		const userId = ctx.user?.user_id;
		const user = getUser(userId);
		const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
			.toISOString()
			.slice(0, 10);

		const text = formatScheduleForDay(user.group_or_name, tomorrow);
		ctx.answerOnCallback({
			message: {
				text,
				attachments: [keyboardWithPhoto("tomorrow")],
				format: "markdown",
			},
		});
	});

	bot.action("this_week", (ctx) => {
		const userId = ctx.user?.user_id;
		const user = getUser(userId);
		const weekDates = getWeekDates(0);

		const text = formatScheduleForWeek(user, weekDates);

		ctx.answerOnCallback({
			message: {
				text: `▶️ Расписание на эту неделю:\n\n${text}`,
				attachments: [keyboardWithPhoto("this_week")],
				format: "markdown",
			},
		});
	});

	bot.action("next_week", (ctx) => {
		const userId = ctx.user?.user_id;
		const user = getUser(userId);
		const weekDates = getWeekDates(1);

		const text = formatScheduleForWeek(user, weekDates);

		ctx.answerOnCallback({
			message: {
				text: `⏭ Расписание на следующую неделю:\n\n${text}`,
				attachments: [keyboardWithPhoto("next_week")],
				format: "markdown",
			},
		});
	});

	bot.action("settings", (ctx) => {
		const userId = ctx.user?.user_id;
		const user = getUser(userId);

		if (user) {
			let text = "";

			if (user.role === "teacher") {
				text = `Вы зарегистрированы как преподаватель.\nФИО: ${user.group_or_name}\n\nЕсли вы хотите сбросить настройки, введите команду /reset`;
			} else if (user.role === "student") {
				text = `Вы зарегистрированы как студент.\nВаша группа: ${user.group_or_name}\n\nЕсли вы хотите сбросить настройки, введите команду /reset`;
			} else {
				text = ru_lexicon["without_role"];
			}

			ctx.answerOnCallback({
				message: {
					text: text,
					attachments: [mainKeyboard],
				},
			});
		}
	});
}
