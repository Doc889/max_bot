import fs from "fs";
import path from "path";

const month = 11;
const year = 2025;

const faculties = {
	"Факультет Математики": ["МТ-101", "МТ-102", "МТ-103"],
	"Факультет Физики": ["ФИ-201", "ФИ-202"],
	"Факультет Химии": ["ХИ-301", "ХИ-302"],
	"Факультет Биологии": ["БИ-401", "БИ-402"],
};

const teachers = [
	"Иванов Иван Иванович",
	"Петров Петр Петрович",
	"Сидоров Сергей Сергеевич",
	"Кузнецова Анна Сергеевна",
	"Смирнов Алексей Петрович",
];

const subjectsByFaculty: Record<string, string[]> = {
	"Факультет Математики": [
		"Алгебра",
		"Геометрия",
		"Математический анализ",
		"Теория вероятностей",
		"Линейная алгебра",
	],
	"Факультет Физики": [
		"Механика",
		"Термодинамика",
		"Оптика",
		"Электродинамика",
	],
	"Факультет Химии": [
		"Органическая химия",
		"Неорганическая химия",
		"Физическая химия",
		"Аналитическая химия",
	],
	"Факультет Биологии": ["Анатомия", "Ботаника", "Зоология", "Генетика"],
};

// 🔥 НЕ пересекающиеся временные слоты
const times = [
	"09:00-10:30",
	"10:40-12:10",
	"12:20-13:50",
	"14:00-15:30",
	"15:40-17:10",
];

const rooms = Array.from({ length: 20 }, (_, i) => (100 + i).toString());
const lessonTypes = ["Лекция", "Практическое занятие", "Лабораторная работа"];

function getDatesInMonth(year: number, month: number) {
	const date = new Date(year, month - 1, 1);
	const dates = [];

	while (date.getMonth() === month - 1) {
		const yyyy = date.getFullYear();
		const mm = String(date.getMonth() + 1).padStart(2, "0");
		const dd = String(date.getDate()).padStart(2, "0");
		dates.push(`${yyyy}-${mm}-${dd}`);
		date.setDate(date.getDate() + 1);
	}

	return dates;
}

const monthDates = getDatesInMonth(year, month);

function getRandom<T>(arr: T[]) {
	return arr[Math.floor(Math.random() * arr.length)];
}

const schedule: any = {
	faculties: {},
	teachers: {},
};

for (const [faculty, groups] of Object.entries(faculties)) {
	schedule.faculties[faculty] = {};

	for (const group of groups) {
		schedule.faculties[faculty][group] = {};

		for (const date of monthDates) {
			const dayOfWeek = new Date(date).getDay();
			if (dayOfWeek === 0) continue; // воскресенье – выходной

			// количество пар от 1 до 3
			const dailyLessonsCount = Math.floor(Math.random() * 3) + 1;

			// выбираем стартовый индекс, чтобы поместились подряд идущие пары
			const maxStart = times.length - dailyLessonsCount;
			const startIndex = Math.floor(Math.random() * (maxStart + 1));

			// берём строго подряд
			const dailyTimes = times.slice(
				startIndex,
				startIndex + dailyLessonsCount,
			);

			schedule.faculties[faculty][group][date] = [];

			for (let i = 0; i < dailyLessonsCount; i++) {
				const teacher = getRandom(teachers);
				const lessonType = getRandom(lessonTypes);

				const lesson = {
					time: dailyTimes[i],
					subject: getRandom(subjectsByFaculty[faculty]),
					room: getRandom(rooms),
					teacher,
					type: lessonType,
				};

				schedule.faculties[faculty][group][date].push(lesson);

				if (!schedule.teachers[teacher]) schedule.teachers[teacher] = {};
				if (!schedule.teachers[teacher][date])
					schedule.teachers[teacher][date] = [];

				schedule.teachers[teacher][date].push({
					group,
					faculty,
					time: lesson.time,
					subject: lesson.subject,
					room: lesson.room,
					type: lessonType,
				});
			}
		}
	}
}

const outputPath = path.resolve("./files/schedule.json");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(schedule, null, 2), "utf-8");

console.log(`Расписание успешно сгенерировано: ${outputPath}`);
