// src/utils/logger.ts
import fs from "fs";
import path from "path";

class Logger {
  private logDir: string;
  private logFile: string;
  private isDevelopment: boolean;

  constructor() {
    this.logDir = path.join(__dirname, "../../logs");
    this.logFile = path.join(this.logDir, "app.log");
    this.isDevelopment = process.env.NODE_ENV === "DEV";

    // Only create log directory in development
    if (this.isDevelopment) {
      this.ensureLogDirectory();
    }
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatLog(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? `\n${JSON.stringify(meta, null, 2)}` : "";
    return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
  }

  private writeLog(level: string, message: string, meta?: any) {
    // Only log in development mode
    if (!this.isDevelopment) {
      return;
    }

    const logEntry = this.formatLog(level, message, meta);

    // Write to file
    fs.appendFileSync(this.logFile, logEntry);

    // Also log to console
    if (level === "ERROR") {
      console.error(logEntry);
    } else {
      console.log(logEntry);
    }
  }

  info(message: string, meta?: any) {
    this.writeLog("INFO", message, meta);
  }

  error(message: string, meta?: any) {
    this.writeLog("ERROR", message, meta);
  }

  warn(message: string, meta?: any) {
    this.writeLog("WARN", message, meta);
  }

  success(message: string, meta?: any) {
    this.writeLog("SUCCESS", message, meta);
  }

  debug(message: string, meta?: any) {
    this.writeLog("DEBUG", message, meta);
  }
}

export default new Logger();
