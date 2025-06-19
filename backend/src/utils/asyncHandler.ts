// src/utils/asyncHandler.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an asynchronous route handler to catch any promise rejections
 * and pass them to the Express error handling middleware.
 * @param fn The async route handler function.
 * @returns A new function that Express can use as a route handler.
 */
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
