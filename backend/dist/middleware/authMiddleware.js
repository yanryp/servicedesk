"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
    process.exit(1);
}
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            // Verify token
            // @ts-ignore - Bypassing a persistent TS error for jwt.verify until types are fully resolved
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            console.log('Decoded Token:', decoded); // Add logging
            // Attach user to the request object
            req.user = {
                id: decoded.id,
                role: decoded.role,
                email: decoded.email,
                departmentId: decoded.departmentId,
                username: decoded.username,
                isKasdaUser: decoded.isKasdaUser,
                isBusinessReviewer: decoded.isBusinessReviewer
            };
            next();
        }
        catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({
                message: 'Not authorized, token failed.',
                error: error.message || 'No additional error information.'
            });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
        return;
    }
};
exports.protect = protect;
// Optional: Middleware to restrict access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return; // End execution for this path
        }
        if (!req.user || !req.user.role) {
            res.status(401).json({ message: 'User role not found in token' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
            return; // End execution for this path
        }
        next(); // If authorized, pass to the next handler
    };
};
exports.authorize = authorize;
