/**
 * Типы данных для Telegram бота расписания
 */

// ===== Пользователи =====

export type UserRole = "student" | "teacher";

export interface User {
	id: number;
	user_id: number;
	role: UserRole;
	group_or_name: string;
	created_at: string;
}

export interface UserDbRow {
	id: number;
	user_id: number;
	role: string;
	group_or_name: string;
	created_at: string;
}

// ===== Расписание =====

export type LessonType =
	| "Лекция"
	| "Практическое занятие"
	| "Лабораторная работа";

export interface Lesson {
	time: string;
	subject: string;
	room: string;
	teacher: string;
	type: LessonType;
}

export interface TeacherLesson {
	time: string;
	subject: string;
	room: string;
	type: LessonType;
	group: string;
	faculty: string;
}

export interface ScheduleData {
	faculties: Record<string, Record<string, Record<string, Lesson[]>>>;
	teachers: Record<string, Record<string, TeacherLesson[]>>;
}

// ===== Клавиатуры =====

export interface KeyboardButton {
	text: string;
	callback_data?: string;
}

export interface KeyboardRow {
	buttons: KeyboardButton[];
}

export interface InlineKeyboard {
	inline_keyboard: KeyboardRow[];
}

// ===== Canvas =====

export interface CanvasConfig {
	width: number;
	lineHeight: number;
	blockSpacing: number;
	padding: number;
	titleHeight: number;
	backgroundColor: string;
	textColor: string;
	headerColor: string;
	blockBgColor: string;
}

export interface DaySchedule {
	date: string;
	dayName: string;
	lessons: Lesson[] | TeacherLesson[];
}

// ===== Утилиты =====

export type DateString = string; // Формат: "YYYY-MM-DD"
