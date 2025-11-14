/**
 * Глобальная настройка тестов
 * Выполняется перед запуском всех тестов
 */

import { beforeAll, afterAll, vi } from "vitest";
import dotenv from "dotenv";

// Загружаем переменные окружения для тестов
dotenv.config({ path: ".env.test" });

beforeAll(() => {
	// Устанавливаем тестовые переменные окружения
	process.env.NODE_ENV = "test";
	process.env.BOT_TOKEN = "test_bot_token_12345";
	process.env.SCHEDULE_FILE_PATH = "tests/fixtures/test-schedule.json";

	// Мокаем console методы для чистоты вывода тестов
	vi.spyOn(console, "log").mockImplementation(() => {});
	vi.spyOn(console, "info").mockImplementation(() => {});
	vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(() => {
	// Восстанавливаем моки
	vi.restoreAllMocks();
});
