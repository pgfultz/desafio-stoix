import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { config } from "../config";

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";
const TOKEN_LENGTH = 32;
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

interface CsrfConfig {
  ignoredMethods: Set<string>;
  trustedOrigins: string[];
  cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict" | "lax" | "none";
    path: string;
    maxAge: number;
  };
}

function createSecureToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString("base64url");
}

function getConfig(): CsrfConfig {
  const isProduction = process.env.NODE_ENV === "production";
  
  return {
    ignoredMethods: new Set(["GET", "HEAD", "OPTIONS"]),
    trustedOrigins: [config.corsOrigin],
    cookieOptions: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    },
  };
}

function isOriginTrusted(origin: string | undefined, trustedOrigins: string[]): boolean {
  if (!origin) return false;
  
  try {
    const originUrl = new URL(origin);
    return trustedOrigins.some(trusted => {
      const trustedUrl = new URL(trusted);
      return originUrl.origin === trustedUrl.origin;
    });
  } catch {
    return false;
  }
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function generateCsrfToken(): string {
  return createSecureToken();
}

export function setCsrfCookie(res: Response, token: string): void {
  const config = getConfig();
  res.cookie(CSRF_COOKIE_NAME, token, config.cookieOptions);
}

export function clearCsrfCookie(res: Response): void {
  const config = getConfig();
  res.clearCookie(CSRF_COOKIE_NAME, {
    path: config.cookieOptions.path,
    secure: config.cookieOptions.secure,
    sameSite: config.cookieOptions.sameSite,
  });
}

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const config = getConfig();
  const method = req.method.toUpperCase();

  if (config.ignoredMethods.has(method)) {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (!isOriginTrusted(origin, config.trustedOrigins) && 
      !isOriginTrusted(referer, config.trustedOrigins)) {
    res.status(403).json({ 
      error: "Forbidden: Invalid origin",
      code: "INVALID_ORIGIN" 
    });
    return;
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string;

  if (!cookieToken) {
    const newToken = generateCsrfToken();
    setCsrfCookie(res, newToken);
    res.status(403).json({
      error: "CSRF token required",
      code: "TOKEN_REQUIRED",
      retry: true,
    });
    return;
  }

  if (!headerToken) {
    res.status(403).json({
      error: "CSRF header missing",
      code: "HEADER_MISSING",
    });
    return;
  }

  if (!constantTimeCompare(cookieToken, headerToken.trim())) {
    clearCsrfCookie(res);
    res.status(403).json({
      error: "Invalid CSRF token",
      code: "TOKEN_MISMATCH",
    });
    return;
  }

  next();
}

export function refreshCsrfToken(req: Request, res: Response): void {
  const existingToken = req.cookies?.[CSRF_COOKIE_NAME];
  let token = existingToken;
  
  if (!token) {
    token = generateCsrfToken();
    setCsrfCookie(res, token);
  }
  
  res.json({
    token: token,
    header: CSRF_HEADER_NAME,
  });
}

export const csrfConstants = {
  COOKIE_NAME: CSRF_COOKIE_NAME,
  HEADER_NAME: CSRF_HEADER_NAME,
};
