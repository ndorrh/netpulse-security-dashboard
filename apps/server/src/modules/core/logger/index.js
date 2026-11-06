const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  SECURITY: 2,
  WARN: 3,
  ERROR: 4
};

const COLORS = {
  RESET: '\x1b[0m',
  CYAN: '\x1b[36m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  RED: '\x1b[31m',
  MAGENTA: '\x1b[35m',
  BOLD: '\x1b[1m'
};

class Logger {
  constructor(context = 'NetPulse') {
    this.context = context;
  }

  child(subContext) {
    return new Logger(`${this.context}:${subContext}`);
  }

  _format(level, color, msg, meta) {
    const timestamp = new Date().toISOString();
    const metaStr = meta && Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
    return `${color}[${timestamp}] [${level}] [${this.context}]${COLORS.RESET} ${msg}${metaStr}`;
  }

  info(msg, meta) {
    console.log(this._format('INFO', COLORS.CYAN, msg, meta));
  }

  security(msg, meta) {
    console.log(this._format('SECURITY_ALERT', `${COLORS.BOLD}${COLORS.RED}`, msg, meta));
  }

  warn(msg, meta) {
    console.warn(this._format('WARN', COLORS.YELLOW, msg, meta));
  }

  error(msg, meta) {
    console.error(this._format('ERROR', `${COLORS.BOLD}${COLORS.RED}`, msg, meta));
  }

  debug(msg, meta) {
    if (process.env.DEBUG) {
      console.log(this._format('DEBUG', COLORS.MAGENTA, msg, meta));
    }
  }
}

export const logger = new Logger();
