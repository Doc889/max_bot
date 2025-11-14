import { describe, it, expect, vi, beforeEach } from "vitest";

// Мокаем getScheduleForUser для колбэков
vi.mock("../schedule/get_functions.ts", () => ({
	getScheduleForUser: vi.fn().mockReturnValue("MOCK_SCHEDULE"),
}));

import { registerCallbacksMainKeyboard } from "../callbacks/callbacks_main_keyboard.ts";
import { Bot } from "@maxhub/max-bot-api";

describe("Main keyboard callbacks", () => {
	let bot: Bot;

	beforeEach(() => {
		bot = {
			action: vi.fn(),
		} as unknown as Bot;
	});

	it("регистрирует все основные действия", () => {
		registerCallbacksMainKeyboard(bot);
		expect(bot.action).toHaveBeenCalled();
	});
});
