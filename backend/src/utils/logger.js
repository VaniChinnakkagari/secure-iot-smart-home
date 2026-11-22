const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function timestamp() {
  return new Date().toISOString();
}

function format(level, color, message) {
  return `${COLORS.dim}[${timestamp()}]${COLORS.reset} ${color}${level.padEnd(5)}${COLORS.reset} ${message}`;
}

export const logger = {
  info: (msg) => console.log(format('INFO', COLORS.cyan, msg)),
  success: (msg) => console.log(format('OK', COLORS.green, msg)),
  warn: (msg) => console.warn(format('WARN', COLORS.yellow, msg)),
  error: (msg) => console.error(format('ERROR', COLORS.red, msg)),
  debug: (msg) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(format('DEBUG', COLORS.blue, msg));
    }
  },
};