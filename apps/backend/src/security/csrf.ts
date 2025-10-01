import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

const CSRF_COOKIE = "csrfToken";
const CSRF_HEADER = "x-csrf-token";

export function generateCsrfToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

export function setCsrfCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: true, // Torna o cookie inacessivel para javascript (proteção XSS)
    sameSite: isProduction ? "strict" : "lax", // strict em producao, lax em dev
    secure: isProduction, // https apenas em producao
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
  });
}

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = (req.headers[CSRF_HEADER] as string | undefined)?.trim();

  // 🔒 Validação adicional: verifica se a origem é confiável
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
  
  if (origin && !origin.includes(allowedOrigin.replace(/https?:\/\//, ''))) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  // Se não há cookie, gera um novo token
  if (!cookieToken) {
    const newToken = generateCsrfToken();
    setCsrfCookie(res, newToken);
    return res.status(403).json({
      error: "CSRF token required",
      retry: true,
    });
  }

  // Valida se o header está presente e corresponde ao cookie
  if (!headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  return next();
}

export const csrfConstants = { CSRF_COOKIE, CSRF_HEADER };
