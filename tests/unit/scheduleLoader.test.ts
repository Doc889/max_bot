/**
 * Тесты для scheduleLoader
 * Проверяем загрузку, валидацию, кеширование и обработку ошибок
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "fs";
import path from "path";

// Мокаем модули перед импортом
vi.mock("../../src/utils/logger.js", () => ({
	logger: {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
		debug: vi.fn(),
	},
}));

describe("scheduleLoader", () => {
	let loadSchedule: () => any;
	let reloadSchedule: () => any;

	beforeEach(async () => {
		// Очищаем кеш модулей перед каждым тестом
		vi.resetModules();

		// Импортируем функции заново для каждого теста
		const module = await import("../../src/config/scheduleLoader.js");
		loadSchedule = module.loadSchedule;
		reloadSchedule = module.reloadSchedule;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("loadSchedule", () => {
		it("должен успешно загружать валидное расписание", () => {
			// Arrange - используем тестовый файл из fixtures
			process.env.SCHEDULE_FILE_PATH = "tests/fixtures/test-schedule.json";

			// Act
			const result = loadSchedule();

			// Assert
			expect(result).toBeDefined();
			expect(result.faculties).toBeDefined();
			expect(result.teachers).toBeDefined();
			expect(result.faculties["Тестовый факультет"]).toBeDefined();
			expect(result.teachers["Тестов Тест Тестович"]).toBeDefined();
		});

		it("должен кешировать расписание при повторных вызовах", () => {
			// Arrange
			process.env.SCHEDULE_FILE_PATH = "tests/fixtures/test-schedule.json";
			const readFileSyncSpy = vi.spyOn(fs, "readFileSync");

			// Act
			const result1 = loadSchedule();
			const result2 = loadSchedule();
			const result3 = loadSchedule();

			// Assert
			expect(result1).toBe(result2);
			expect(result2).toBe(result3);
			// readFileSync должен вызваться только один раз благодаря кешу
			expect(readFileSyncSpy).toHaveBeenCalledTimes(1);

			readFileSyncSpy.mockRestore();
		});

		it("должен выбросить ошибку если файл не найден", async () => {
			// Arrange
			vi.resetModules();
			process.env.SCHEDULE_FILE_PATH = "nonexistent/schedule.json";
			const module = await import("../../src/config/scheduleLoader.js");

			// Act & Assert
			expect(() => module.loadSchedule()).toThrowError(/Schedule file not found/);
		});

		it("должен выбросить ошибку при невалидном JSON", async () => {
			// Arrange
			vi.resetModules();
			const invalidJsonPath = "tests/fixtures/invalid-schedule.json";

			// Создаем временный файл с невалидным JSON
			fs.writeFileSync(invalidJsonPath, "{ invalid json }");
			process.env.SCHEDULE_FILE_PATH = invalidJsonPath;

			const module = await import("../../src/config/scheduleLoader.js");

			try {
				// Act & Assert
				expect(() => module.loadSchedule()).toThrowError(/Invalid JSON format/);
			} finally {
				// Cleanup
				fs.unlinkSync(invalidJsonPath);
			}
		});

		it("должен валидировать наличие обязательных полей", async () => {
			// Arrange
			vi.resetModules();
			const invalidDataPath = "tests/fixtures/missing-fields.json";

			// Создаем файл без обязательных полей
			fs.writeFileSync(invalidDataPath, JSON.stringify({ faculties: {} }));
			process.env.SCHEDULE_FILE_PATH = invalidDataPath;

			const module = await import("../../src/config/scheduleLoader.js");

			try {
				// Act & Assert
				expect(() => module.loadSchedule()).toThrowError(
					/missing required fields/,
				);
			} finally {
				// Cleanup
				fs.unlinkSync(invalidDataPath);
			}
		});

		it("должен валидировать типы данных полей", async () => {
			// Arrange
			vi.resetModules();
			const invalidTypePath = "tests/fixtures/invalid-types.json";

			// Создаем файл с неправильными типами
			fs.writeFileSync(
				invalidTypePath,
				JSON.stringify({
					faculties: "not an object",
					teachers: {},
				}),
			);
			process.env.SCHEDULE_FILE_PATH = invalidTypePath;

			const module = await import("../../src/config/scheduleLoader.js");

			try {
				// Act & Assert
				expect(() => module.loadSchedule()).toThrowError(/must be objects/);
			} finally {
				// Cleanup
				fs.unlinkSync(invalidTypePath);
			}
		});

		it("должен использовать путь по умолчанию если SCHEDULE_FILE_PATH не задан", async () => {
			// Arrange
			vi.resetModules();
			delete process.env.SCHEDULE_FILE_PATH;

			const existsSyncSpy = vi.spyOn(fs, "existsSync");
			const module = await import("../../src/config/scheduleLoader.js");

			try {
				module.loadSchedule();
			} catch {
				// Игнорируем ошибку, нас интересует только путь
			}

			// Assert
			const callArgs = existsSyncSpy.mock.calls[0][0] as string;
			expect(callArgs).toContain("src/files/schedule.json");

			existsSyncSpy.mockRestore();
		});
	});

	describe("reloadSchedule", () => {
		it("должен очищать кеш и перезагружать расписание", () => {
			// Arrange
			process.env.SCHEDULE_FILE_PATH = "tests/fixtures/test-schedule.json";
			const readFileSyncSpy = vi.spyOn(fs, "readFileSync");

			// Act
			loadSchedule(); // Первая загрузка
			expect(readFileSyncSpy).toHaveBeenCalledTimes(1);

			loadSchedule(); // Из кеша
			expect(readFileSyncSpy).toHaveBeenCalledTimes(1);

			reloadSchedule(); // Перезагрузка
			expect(readFileSyncSpy).toHaveBeenCalledTimes(2);

			// Assert
			expect(readFileSyncSpy).toHaveBeenCalledTimes(2);

			readFileSyncSpy.mockRestore();
		});

		it("должен возвращать новые данные после reload", async () => {
			// Arrange
			const tempPath = "tests/fixtures/temp-schedule.json";
			process.env.SCHEDULE_FILE_PATH = tempPath;

			// Создаем первый файл
			const schedule1 = {
				faculties: { Faculty1: {} },
				teachers: { Teacher1: {} },
			};
			fs.writeFileSync(tempPath, JSON.stringify(schedule1));

			vi.resetModules();
			let module = await import("../../src/config/scheduleLoader.js");

			try {
				// Act
				const result1 = module.loadSchedule();
				expect(result1.faculties.Faculty1).toBeDefined();

				// Изменяем файл
				const schedule2 = {
					faculties: { Faculty2: {} },
					teachers: { Teacher2: {} },
				};
				fs.writeFileSync(tempPath, JSON.stringify(schedule2));

				const result2 = module.reloadSchedule();

				// Assert
				expect(result2.faculties.Faculty2).toBeDefined();
				expect(result2.faculties.Faculty1).toBeUndefined();
			} finally {
				// Cleanup
				fs.unlinkSync(tempPath);
			}
		});
	});

	describe("Интеграционные тесты", () => {
		it("должен корректно обрабатывать реальную структуру данных", () => {
			// Arrange
			process.env.SCHEDULE_FILE_PATH = "tests/fixtures/test-schedule.json";

			// Act
			const schedule = loadSchedule();

			// Assert - проверяем структуру
			const faculty = schedule.faculties["Тестовый факультет"];
			expect(faculty).toBeDefined();

			const group = faculty["TEST-101"];
			expect(group).toBeDefined();

			const lessons = group["2025-11-15"];
			expect(lessons).toBeInstanceOf(Array);
			expect(lessons.length).toBeGreaterThan(0);

			const lesson = lessons[0];
			expect(lesson).toHaveProperty("time");
			expect(lesson).toHaveProperty("subject");
			expect(lesson).toHaveProperty("room");
			expect(lesson).toHaveProperty("teacher");
			expect(lesson).toHaveProperty("type");
		});

		it("должен корректно обрабатывать расписание преподавателей", () => {
			// Arrange
			process.env.SCHEDULE_FILE_PATH = "tests/fixtures/test-schedule.json";

			// Act
			const schedule = loadSchedule();

			// Assert
			const teacher = schedule.teachers["Тестов Тест Тестович"];
			expect(teacher).toBeDefined();

			const teacherLessons = teacher["2025-11-15"];
			expect(teacherLessons).toBeInstanceOf(Array);
			expect(teacherLessons[0]).toHaveProperty("group");
			expect(teacherLessons[0]).toHaveProperty("faculty");
		});
	});
});
