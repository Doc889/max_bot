/**
 * Простая система логирования
 */

type LogLevel = "info" | "warn" | "error" | "debug";

function getTimestamp(): string {
	return new Date().toISOString();
}

function formatLog(level: LogLevel, message: string, meta?: unknown): string {
	const timestamp = getTimestamp();
	const metaStr = meta ? ` | ${JSON.stringify(meta)}` : "";
	return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
	info: (message: string, meta?: unknown) => {
		console.log(formatLog("info", message, meta));
	},

	warn: (message: string, meta?: unknown) => {
		console.warn(formatLog("warn", message, meta));
	},

	error: (message: string, error?: unknown) => {
		const errorMeta =
			error instanceof Error
				? { message: error.message, stack: error.stack }
				: error;
		console.error(formatLog("error", message, errorMeta));
	},

	debug: (message: string, meta?: unknown) => {
		if (process.env.NODE_ENV === "development") {
			console.debug(formatLog("debug", message, meta));
		}
	},
};
