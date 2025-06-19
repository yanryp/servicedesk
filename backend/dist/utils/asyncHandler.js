"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wraps an asynchronous route handler to catch any promise rejections
 * and pass them to the Express error handling middleware.
 * @param fn The async route handler function.
 * @returns A new function that Express can use as a route handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.default = asyncHandler;
