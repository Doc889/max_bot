import { type CanvasRenderingContext2D, createCanvas } from "canvas";
import fs from "fs";

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
	lessons: any[],
	dateStr: string,
	group: string,
) {
	const canvasWidth = 1000;
	const lineHeight = 38;
	const blockSpacing = 20;
	const padding = 50;
	const titleHeight = 80;

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
	ctx.font = "bold 64px sans-serif";
	ctx.fillText(group, padding, padding + 40);

	ctx.font = "bold 38px sans-serif";
	ctx.fillText(formattedDate, padding, padding + 90);

	let currentY = padding + titleHeight + 60;

	ctx.fillStyle = "#000";
	ctx.font = "30px sans-serif";

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

		let rectColor = "green";
		switch ((lesson.type || "Лекция").toLowerCase()) {
			case "лекция":
				rectColor = "#4dacffff";
				break;
			case "практическое занятие":
				rectColor = "#6cb408ff";
				break;
			case "лабораторная работа":
				rectColor = "#d501ffff";
				break;
		}

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
	lessonsByDay: { date: string; lessons: any[] }[],
	group: string,
) {
	const width = 2500;
	const padding = 60;
	const columnGap = 120;
	const lineHeight = 64;
	const blockSpacing = 40;
	const titleHeight = 120;

	const half = Math.ceil(lessonsByDay.length / 2);
	const leftColumnDays = lessonsByDay.slice(0, half);
	const rightColumnDays = lessonsByDay.slice(half);

	const tempHeight = 6000;
	const columnWidth = (width - columnGap - padding * 2) / 2;
	const canvas = createCanvas(width, tempHeight);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, width, tempHeight);

	ctx.fillStyle = "#333";
	ctx.font = "bold 80px sans-serif";
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
			ctx.font = "bold 56px sans-serif";
			ctx.fillText(formattedDate, startX, currentY - 15);

			currentY += 60;
			ctx.font = "48px sans-serif";

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
				let rectColor = "#63d814ff";
				switch ((lesson.type || "Лекция").toLowerCase()) {
					case "лекция":
						rectColor = "#4dacffff";
						break;
					case "практическое занятие":
						rectColor = "#6cb408ff";
						break;
					case "лабораторная работа":
						rectColor = "#d501ffff";
						break;
				}

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
