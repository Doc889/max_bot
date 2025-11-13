import { Bot } from "@maxhub/max-bot-api";
import dotenv from "dotenv";
import { registerCallbacksMainKeyboard } from "./callbacks/callbacks_main_keyboard.ts";
import { registerCallbacksPicture } from "./callbacks/callbacks_picture.ts";
import { registerCallbacksSettings } from "./callbacks/callbacks_settings.ts";
import { registerUserHandlers } from "./handlers/user_handler.ts";

dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN не задан");

export const bot: Bot = new Bot(token);

registerCallbacksMainKeyboard(bot);
registerCallbacksPicture(bot);
registerCallbacksSettings(bot);
registerUserHandlers(bot);

bot.start();
console.log("✅ Бот запущен");
