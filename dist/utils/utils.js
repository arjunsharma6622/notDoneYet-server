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
exports.connectDB = exports.BASE_URL = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://notdoneyet-server.vercel.app";
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoURL = process.env.MONGO_URL;
        if (!mongoURL) {
            throw new Error("MongoDB URL is not provided in environment variables");
        }
        yield mongoose_1.default.connect(mongoURL);
        console.log(`DB Connected Successfully!!!🙂🚀🚀`);
    }
    catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
});
exports.connectDB = connectDB;
