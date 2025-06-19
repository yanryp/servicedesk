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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: parseInt(process.env.EMAIL_PORT || '587', 10) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // Your email username
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
});
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const info = yield transporter.sendMail({
            from: `"Ticketing System" <${process.env.EMAIL_FROM}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    }
    catch (error) {
        console.error('Error sending email:', error);
        // In a real app, you might want to throw the error or handle it differently
        // For now, we'll just log it to avoid crashing the ticket creation process
    }
});
exports.sendEmail = sendEmail;
