/**
 * Централизованная загрузка расписания
 * Заменяет дублирование кода в 6 местах
 */

import fs from "fs";
import path from "path";
import type { ScheduleData } from "../types/index.js";
import { logger } from "../utils/logger.js";

let cachedSchedule: ScheduleData | null = null;

/**
 * Получает путь к файлу расписания
 * Поддерживает переменную окружения SCHEDULE_FILE_PATH
 */
function getSchedulePath(): string {
	return process.env.SCHEDULE_FILE_PATH || "src/files/schedule.json";
}

/**
 * Загружает расписание из JSON файла с кешированием
 * @throws Error если файл не найден или имеет неверный формат
 */
export function loadSchedule(): ScheduleData {
	if (cachedSchedule) {
		return cachedSchedule;
	}

	const schedulePath = path.resolve(getSchedulePath());

	// Проверка существования файла
	if (!fs.existsSync(schedulePath)) {
		const examplePath = path.resolve("src/files/schedule.example.json");
		logger.error("Schedule file not found", { path: schedulePath });
		throw new Error(
			`Schedule file not found at: ${schedulePath}\n\n` +
				"Please create your schedule.json file:\n" +
				`1. Copy the example: cp ${examplePath} ${schedulePath}\n` +
				"2. Edit the file with your schedule data\n" +
				"3. Or set SCHEDULE_FILE_PATH environment variable to your file location",
		);
	}

	try {
		const rawData = fs.readFileSync(schedulePath, "utf-8");
		const data = JSON.parse(rawData) as ScheduleData;

		// Валидация структуры данных
		if (!data.faculties || !data.teachers) {
			throw new Error(
				"Invalid schedule format: missing required fields 'faculties' or 'teachers'",
			);
		}

		if (
			typeof data.faculties !== "object" ||
			typeof data.teachers !== "object"
		) {
			throw new Error(
				"Invalid schedule format: 'faculties' and 'teachers' must be objects",
			);
		}

		cachedSchedule = data;
		logger.info("Schedule loaded successfully", { path: schedulePath });
		return cachedSchedule;
	} catch (error) {
		if (error instanceof SyntaxError) {
			logger.error("Invalid JSON in schedule file", { path: schedulePath });
			throw new Error(
				`Invalid JSON format in schedule file: ${schedulePath}\n` +
					"Please check your JSON syntax",
			);
		}
		logger.error("Failed to load schedule", error);
		throw error;
	}
}

/**
 * Очищает кеш расписания (полезно для перезагрузки)
 */
export function reloadSchedule(): ScheduleData {
	cachedSchedule = null;
	return loadSchedule();
}
