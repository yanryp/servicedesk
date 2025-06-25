"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/auth.ts
const express_1 = __importDefault(require("express"));
// @ts-ignore
const bcrypt_1 = __importDefault(require("bcrypt"));
// @ts-ignore
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../db/prisma"));
const router = express_1.default.Router();
const SALT_ROUNDS = 10; // For bcrypt hashing
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
    process.exit(1); // Exit if JWT_SECRET is not set
}
// Utility to handle async route errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// POST /api/auth/register
router.post('/register', asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, role, departmentId, firstName, lastName, specialization } = req.body;
    // Basic validation
    if (!username || !email || !password || !role || !departmentId) {
        return next(Object.assign(new Error('Username, email, password, role, and departmentId are required.'), { status: 400 }));
    }
    const validRoles = ['admin', 'technician', 'requester', 'manager'];
    if (!validRoles.includes(role)) {
        return next(Object.assign(new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`), { status: 400 }));
    }
    // Additional validation for technician specialization
    if (role === 'technician' && specialization) {
        if (!specialization.primarySkill || !specialization.experienceLevel) {
            return next(Object.assign(new Error('Primary skill and experience level are required for technicians.'), { status: 400 }));
        }
    }
    // Verify department exists
    const department = yield prisma_1.default.department.findUnique({
        where: { id: parseInt(departmentId) }
    });
    if (!department) {
        return next(Object.assign(new Error('Invalid department ID.'), { status: 400 }));
    }
    // Check if user already exists
    const existingUser = yield prisma_1.default.user.findFirst({
        where: {
            OR: [
                { username: username },
                { email: email }
            ]
        }
    });
    if (existingUser) {
        return next(Object.assign(new Error('Username or email already exists.'), { status: 409 }));
    }
    // Hash password
    const hashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
    // Prepare user data
    const userData = {
        username,
        email,
        passwordHash: hashedPassword,
        role: role,
        departmentId: parseInt(departmentId)
    };
    // Add technician specialization fields if provided
    if (role === 'technician' && specialization) {
        userData.primarySkill = specialization.primarySkill;
        userData.experienceLevel = specialization.experienceLevel;
        userData.secondarySkills = specialization.secondarySkills;
    }
    // Create new user
    const newUser = yield prisma_1.default.user.create({
        data: userData,
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            departmentId: true,
            primarySkill: true,
            experienceLevel: true,
            secondarySkills: true,
            createdAt: true,
            department: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
    res.status(201).json({
        message: 'User registered successfully!',
        user: newUser,
    });
})));
// POST /api/auth/login
router.post('/login', asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(Object.assign(new Error('Email and password are required.'), { status: 400 }));
    }
    // Find user by email with department and unit information
    const user = yield prisma_1.default.user.findUnique({
        where: { email },
        include: {
            department: true,
            unit: true
        }
    });
    if (!user) {
        return next(Object.assign(new Error('Invalid credentials.'), { status: 401 })); // User not found
    }
    const passwordMatch = yield bcrypt_1.default.compare(password, user.passwordHash);
    if (!passwordMatch) {
        return next(Object.assign(new Error('Invalid credentials.'), { status: 401 })); // Password incorrect
    }
    // Generate JWT with department and unit information
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        departmentId: user.departmentId,
        unitId: user.unitId,
        isKasdaUser: user.isKasdaUser,
        isBusinessReviewer: user.isBusinessReviewer
    }, JWT_SECRET, { expiresIn: '1h' } // Token expires in 1 hour
    );
    res.json({
        message: 'Login successful!',
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            departmentId: user.departmentId,
            unitId: user.unitId,
            isKasdaUser: user.isKasdaUser,
            isBusinessReviewer: user.isBusinessReviewer,
            department: user.department,
            unit: user.unit
        }
    });
})));
// Basic error handling middleware (add to index.ts or a dedicated error handling module later)
// For now, this simple handler will catch errors passed by next()
router.use((err, req, res, next) => {
    console.error("Error in auth route:", err.stack);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
});
exports.default = router;
