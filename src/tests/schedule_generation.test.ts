import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("schedule_generation", () => {
	const schedulePath = path.resolve("./files/schedule.json");

	it("schedule.json существует и является корректным JSON", () => {
		const raw = fs.readFileSync(schedulePath, "utf-8");
		expect(() => JSON.parse(raw)).not.toThrow();
	});

	it("содержит ключи faculties и teachers", () => {
		const data = JSON.parse(fs.readFileSync(schedulePath, "utf-8"));
		expect(data).toHaveProperty("faculties");
		expect(data).toHaveProperty("teachers");
	});
});
