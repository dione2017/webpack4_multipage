import path from "path";

export const { NODE_ENV } = process.env;

export const isDevelopment = NODE_ENV === "development";

export const isProduction = NODE_ENV === "production";

export const shouldUseSourceMap = true;

export const PORT = process.env.port || 9001;

export const PROTOCOL = process.env.HTTPS === 'true' ? 'https' : 'http';

export const HOST = "127.0.0.1";

export const appPath = path.join(process.cwd(), "./app");
