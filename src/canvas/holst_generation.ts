import { type CanvasRenderingContext2D, createCanvas } from "canvas";
import type { Lesson, LessonType, TeacherLesson } from "../types/index.js";

// Константы для генерации изображения на день
const DAY_CANVAS = {
	WIDTH: 1000,
	LINE_HEIGHT: 38,
	BLOCK_SPACING: 20,
	PADDING: 50,
	TITLE_HEIGHT: 80,
	FONT_SIZE_TITLE: 64,
	FONT_SIZE_DATE: 38,
	FONT_SIZE_TEXT: 30,
} as const;

// Константы для генерации изображения на неделю
const WEEK_CANVAS = {
	WIDTH: 2500,
	PADDING: 60,
	COLUMN_GAP: 120,
	LINE_HEIGHT: 64,
	BLOCK_SPACING: 40,
	TITLE_HEIGHT: 120,
	TEMP_HEIGHT: 6000,
	FONT_SIZE_TITLE: 80,
	FONT_SIZE_DATE: 56,
	FONT_SIZE_TEXT: 48,
} as const;

// Цвета для типов занятий
const LESSON_TYPE_COLORS: Record<string, string> = {
	лекция: "#4dacffff",
	"практическое занятие": "#6cb408ff",
	"лабораторная работа": "#d501ffff",
};

function getLessonColor(lessonType: string): string {
	return LESSON_TYPE_COLORS[lessonType.toLowerCase()] || "#63d814ff";
}

function wrapText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	maxWidth: number,
	lineHeight: number,
) {
	const words = text.split(" ");
	let line = "";
	let currentY = y;

	for (const word of words) {
		const testLine = line + word + " ";
		const metrics = ctx.measureText(testLine);
		if (metrics.width > maxWidth && line !== "") {
			ctx.fillText(line.trim(), x, currentY);
			line = word + " ";
			currentY += lineHeight;
		} else {
			line = testLine;
		}
	}
	if (line) {
		ctx.fillText(line.trim(), x, currentY);
	}

	return currentY;
}

export function generateScheduleImage(
	lessons: Lesson[] | TeacherLesson[],
	dateStr: string,
	group: string,
) {
	const canvasWidth = DAY_CANVAS.WIDTH;
	const lineHeight = DAY_CANVAS.LINE_HEIGHT;
	const blockSpacing = DAY_CANVAS.BLOCK_SPACING;
	const padding = DAY_CANVAS.PADDING;
	const titleHeight = DAY_CANVAS.TITLE_HEIGHT;

	let totalLines = 0;
	lessons.forEach((lesson) => {
		totalLines += 1;
		totalLines += 1;
		totalLines += 1;
		totalLines += 1;
		totalLines += 1;
	});

	const estimatedHeight =
		padding * 2 +
		titleHeight +
		totalLines * lineHeight +
		lessons.length * blockSpacing;
	const canvasHeight = Math.max(estimatedHeight, canvasWidth);

	const canvas = createCanvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	ctx.fillStyle = "#333";
	ctx.font = "36px sans-serif";

	const date = new Date(dateStr);

	const weekday = new Intl.DateTimeFormat("ru-RU", { weekday: "long" }).format(
		date,
	);
	const weekdayName = weekday.charAt(0).toUpperCase() + weekday.slice(1);

	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");

	const formattedDate = `${weekdayName}, ${day}.${month}`;

	ctx.fillStyle = "#333";
	ctx.font = `bold ${DAY_CANVAS.FONT_SIZE_TITLE}px sans-serif`;
	ctx.fillText(group, padding, padding + 40);

	ctx.font = `bold ${DAY_CANVAS.FONT_SIZE_DATE}px sans-serif`;
	ctx.fillText(formattedDate, padding, padding + 90);

	let currentY = padding + titleHeight + 60;

	ctx.fillStyle = "#000";
	ctx.font = `${DAY_CANVAS.FONT_SIZE_TEXT}px sans-serif`;

	lessons.forEach((lesson, i) => {
		ctx.fillStyle = "black";
		ctx.fillText(lesson.time || "", padding, currentY);

		currentY += lineHeight;

		const subjectText = `${i + 1}. ${lesson.subject}`;
		currentY =
			wrapText(
				ctx,
				subjectText,
				padding + 20,
				currentY,
				canvasWidth - padding * 2 - 50,
				lineHeight,
			) + lineHeight;

		const rectColor = getLessonColor(lesson.type || "Лекция");

		const rectX = padding;
		const rectY = currentY - lineHeight - 25;
		const rectWidth = 10;
		const rectHeight = 105;

		ctx.fillStyle = rectColor;
		ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

		ctx.fillStyle = "black";
		const typeText = lesson.type || "Лекция";
		currentY =
			wrapText(
				ctx,
				typeText,
				padding + rectWidth + 10,
				currentY,
				canvasWidth - padding * 2 - rectWidth - 10,
				lineHeight,
			) + lineHeight;

		const teacherText = lesson.teacher || "";
		currentY =
			wrapText(
				ctx,
				teacherText,
				padding + rectWidth + 10,
				currentY,
				canvasWidth - padding * 2 - rectWidth - 10,
				lineHeight,
			) + lineHeight;

		ctx.fillText(
			`каб. ${lesson.room}` || "-",
			canvasWidth - padding - 120,
			currentY - lineHeight,
		);

		currentY += blockSpacing;
	});

	return canvas.toBuffer("image/png");
}

export function generateWeekImage(
	lessonsByDay: { date: string; lessons: Lesson[] | TeacherLesson[] }[],
	group: string,
) {
	const width = WEEK_CANVAS.WIDTH;
	const padding = WEEK_CANVAS.PADDING;
	const columnGap = WEEK_CANVAS.COLUMN_GAP;
	const lineHeight = WEEK_CANVAS.LINE_HEIGHT;
	const blockSpacing = WEEK_CANVAS.BLOCK_SPACING;
	const titleHeight = WEEK_CANVAS.TITLE_HEIGHT;

	const half = Math.ceil(lessonsByDay.length / 2);
	const leftColumnDays = lessonsByDay.slice(0, half);
	const rightColumnDays = lessonsByDay.slice(half);

	const tempHeight = WEEK_CANVAS.TEMP_HEIGHT;
	const columnWidth = (width - columnGap - padding * 2) / 2;
	const canvas = createCanvas(width, tempHeight);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, width, tempHeight);

	ctx.fillStyle = "#333";
	ctx.font = `bold ${WEEK_CANVAS.FONT_SIZE_TITLE}px sans-serif`;
	ctx.fillText(group, padding, padding + 40);

	let maxUsedY = 0;

	const drawColumn = (days: typeof lessonsByDay, startX: number) => {
		let currentY = padding + 120;

		days.forEach((day) => {
			if (
				!day.lessons ||
				day.lessons.length === 0 ||
				day.lessons[0].subject === "Расписание на этот день отсутствует"
			) {
				return;
			}

			const date = new Date(day.date);
			const weekday = new Intl.DateTimeFormat("ru-RU", {
				weekday: "long",
			}).format(date);
			const weekdayName = weekday.charAt(0).toUpperCase() + weekday.slice(1);
			const formattedDate = `${weekdayName}, ${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`;

			ctx.fillStyle = "#333";
			ctx.font = `bold ${WEEK_CANVAS.FONT_SIZE_DATE}px sans-serif`;
			ctx.fillText(formattedDate, startX, currentY - 15);

			currentY += 60;
			ctx.font = `${WEEK_CANVAS.FONT_SIZE_TEXT}px sans-serif`;

			day.lessons.forEach((lesson, i) => {
				const startY = currentY;
				const textOffset = 40;

				ctx.fillStyle = "#000";
				ctx.fillText(lesson.time || "", startX, currentY);
				currentY += lineHeight;

				const subjectText = `${i + 1}. ${lesson.subject}`;
				currentY =
					wrapText(
						ctx,
						subjectText,
						startX + textOffset,
						currentY,
						columnWidth - textOffset - 50,
						lineHeight,
					) + lineHeight;

				const typeText = lesson.type || "Лекция";
				ctx.fillStyle = "black";
				currentY =
					wrapText(
						ctx,
						typeText,
						startX + textOffset,
						currentY,
						columnWidth - textOffset - 50,
						lineHeight,
					) + lineHeight;

				const teacherText = lesson.teacher || "";
				currentY =
					wrapText(
						ctx,
						teacherText,
						startX + textOffset,
						currentY,
						columnWidth - textOffset - 50,
						lineHeight,
					) + lineHeight;

				ctx.font = "48px sans-serif";
				ctx.fillText(
					`каб. ${lesson.room}` || "-",
					startX + columnWidth - 220,
					currentY - lineHeight,
				);

				const endY = currentY - 10;
				const rectColor = getLessonColor(lesson.type || "Лекция");

				const rectX = startX + 5;
				const rectY = startY + 25;
				const rectWidth = 14;
				const rectHeight = endY - startY - 70;
				ctx.fillStyle = rectColor;
				ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

				currentY += blockSpacing;
			});

			currentY += 40;
			maxUsedY = Math.max(maxUsedY, currentY);
		});
	};

	drawColumn(leftColumnDays, padding);
	drawColumn(rightColumnDays, padding + columnWidth + columnGap);

	const finalCanvas = createCanvas(width, maxUsedY + padding);
	const finalCtx = finalCanvas.getContext("2d");
	finalCtx.drawImage(
		canvas,
		0,
		0,
		width,
		maxUsedY + padding,
		0,
		0,
		width,
		maxUsedY + padding,
	);

	return finalCanvas.toBuffer("image/png");
}
