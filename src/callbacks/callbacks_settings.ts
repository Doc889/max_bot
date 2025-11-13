import type { Bot } from "@maxhub/max-bot-api";
import fs from "fs";
import path from "path";
import { saveUser } from "../db/db_functions.ts";
import { userGroups, userSelectedTeacher } from "../globals.ts";
import {
	facultiesKeyboard,
	groupsKeyboard,
	mainKeyboard,
	teacherKeyboard,
} from "../keyboards.ts";
import { ru_lexicon } from "../LEXICON/ru_lexicon.ts";

const schedulePath = path.resolve("./files/schedule.json");
const scheduleData = JSON.parse(fs.readFileSync(schedulePath, "utf-8"));

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

		userGroups[userId] = group;
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

		userSelectedTeacher[userId] = teacherName;
		saveUser(userId, "teacher", teacherName);

		ctx.answerOnCallback({
			message: {
				text: ru_lexicon["endSetting"],
				attachments: [mainKeyboard],
			},
		});
	});
}
