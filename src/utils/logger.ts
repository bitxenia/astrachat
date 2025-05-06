export type LogLevel = "debug" | "info" | "warn" | "error";

const levels: LogLevel[] = ["debug", "info", "warn", "error"];
let currentLevel: LogLevel = "warn";

function shouldLog(level: LogLevel): boolean {
  return levels.indexOf(level) >= levels.indexOf(currentLevel);
}

function logWithTimestamp(
  method: (...args: any[]) => void,
  level: LogLevel,
  args: any[],
): void {
  if (shouldLog(level)) {
    const timestamp = new Date().toISOString();
    method(`[${timestamp}] [${level.toUpperCase()}]`, ...args);
  }
}

interface LoggerInterface {
  setLevel: (level: LogLevel) => void;
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

export const logger: LoggerInterface = {
  setLevel(level: LogLevel): void {
    if (levels.includes(level)) {
      currentLevel = level;
    }
  },
  debug(...args: any[]): void {
    logWithTimestamp(console.debug, "debug", args);
  },
  info(...args: any[]): void {
    logWithTimestamp(console.info, "info", args);
  },
  warn(...args: any[]): void {
    logWithTimestamp(console.warn, "warn", args);
  },
  error(...args: any[]): void {
    logWithTimestamp(console.error, "error", args);
  },
};
