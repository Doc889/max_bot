import type { Bot } from "@maxhub/max-bot-api";
import { saveUser } from "../config/database.js";
import { loadSchedule } from "../config/scheduleLoader.js";
import {
	facultiesKeyboard,
	groupsKeyboard,
	mainKeyboard,
	teacherKeyboard,
} from "../keyboards.ts";
import { ru_lexicon } from "../LEXICON/ru_lexicon.ts";

const scheduleData = loadSchedule();

export function registerCallbacksSettings(bot: Bot) {
	bot.action("student", (ctx) => {
		ctx.answerOnCallback({
			message: {
				text: ru_lexicon["faculty"],
				attachments: [facultiesKeyboard],
			},
		});
	});

	bot.action(/^faculty_(.+)$/, (ctx) => {
		const faculty = ctx.match[1];

		const groups = Object.keys(scheduleData.faculties[faculty] || {});
		if (!groups.length) return;

		ctx.answerOnCallback({
			message: {
				text: ru_lexicon["group"],
				attachments: [groupsKeyboard(groups)],
			},
		});
	});

	bot.action(/^group_(.+)$/, (ctx) => {
		const group = ctx.match[1];
		const userId = ctx.user?.user_id;

		if (!userId) return;

		saveUser(userId, "student", group);

		ctx.answerOnCallback({
			message: {
				text: ru_lexicon["endSetting"],
				attachments: [mainKeyboard],
			},
		});
	});

	bot.action("teacher", (ctx) => {
		ctx.answerOnCallback({
			message: {
				text: ru_lexicon["teacher"],
				attachments: [teacherKeyboard],
			},
		});
	});

	bot.action(/^teacher_(.+)$/, (ctx) => {
		const teacherName = ctx.match[1];
		const userId = ctx.user?.user_id;

		if (!userId) return;

		saveUser(userId, "teacher", teacherName);

		ctx.answerOnCallback({
			message: {
				text: ru_lexicon["endSetting"],
				attachments: [mainKeyboard],
			},
		});
	});
}
