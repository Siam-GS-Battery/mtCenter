import type { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function sendSuccess<T>(res: Response, data: T, status = 200): Response {
  return res.status(status).json({ success: true, data });
}

export interface PageMeta {
  total: number;
  limit: number;
  offset: number;
}

// Same as sendSuccess but also includes pagination metadata, used by list endpoints
// that support ?limit=&offset= (see docs/data-import-spec.md Section 5/B).
export function sendPaginated<T>(res: Response, data: T[], meta: PageMeta, status = 200): Response {
  return res.status(status).json({ success: true, data, meta });
}

export function sendError(res: Response, status: number, message: string): Response {
  return res.status(status).json({ success: false, error: { message } });
}

// Wraps async route handlers so thrown/rejected errors reach errorHandler.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);

  if (err instanceof ApiError) {
    sendError(res, err.status, err.message);
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  sendError(res, 500, message);
}
