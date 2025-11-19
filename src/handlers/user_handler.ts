import type { Bot } from "@maxhub/max-bot-api";
import { deleteUser, getUser } from "../config/database.js";
import {
	facultiesKeyboard,
	mainKeyboard,
	teacherStudentKeyboard,
} from "../keyboards.ts";
import { ru_lexicon } from "../LEXICON/ru_lexicon.ts";

export function registerUserHandlers(bot: Bot) {
	bot.command("start", async (ctx) => {
		const userId = ctx.user?.user_id;

		const user = getUser(userId);

		if (user) {
			// Пользователь уже есть в базе
			await ctx.reply(
				`Вы уже зарегистрированы как ${user.role} (${user.group_or_name})\nДля того, чтобы сбросить настройки введите команду /reset`,
				{
					attachments: [mainKeyboard], // сразу показываем mainKeyboard
				},
			);
		} else
			await ctx.reply(ru_lexicon["/start"], {
				attachments: [teacherStudentKeyboard],
			});
	});

	bot.command("reset", async (ctx) => {
		const userId = ctx.user?.user_id;

		const user = getUser(userId);

		if (user) deleteUser(userId);

		ctx.reply(ru_lexicon["/reset"], {
			attachments: [teacherStudentKeyboard],
		});
	});
}
