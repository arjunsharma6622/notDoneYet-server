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
exports.createJWTToken = exports.checkNameAvailability = exports.deleteImageFromCloudinary = exports.cookieOptions = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
exports.cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
};
const deleteImageFromCloudinary = (_a) => __awaiter(void 0, [_a], void 0, function* ({ secureUrl }) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    try {
        const splitUrl = secureUrl.split("/ndy/");
        const publicIdWithExtension = splitUrl[1];
        const lastDotIndex = publicIdWithExtension.lastIndexOf(".");
        const publicId = publicIdWithExtension.substring(0, lastDotIndex);
        const res = yield cloudinary_1.v2.uploader.destroy(`ndy/${publicId}`, {
            invalidate: true,
        });
        return res;
    }
    catch (err) {
        console.log(err);
        console.log('error in deleting the image from cloudinary');
    }
    return true;
});
exports.deleteImageFromCloudinary = deleteImageFromCloudinary;
const checkNameAvailability = (Model, nameField, nameValue, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!nameValue) {
            return res.status(400).json({ error: `${nameField} is required` });
        }
        const item = yield Model.findOne({ [nameField]: nameValue });
        if (item) {
            return res
                .status(200)
                .json({ message: `${nameField} is already taken`, available: false });
        }
        return res
            .status(200)
            .json({ message: `${nameField} is available`, available: true });
    }
    catch (err) {
        console.error(`Error fetching ${nameField}: ${err}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.checkNameAvailability = checkNameAvailability;
const secretKey = process.env.JWT_SECRET;
const createJWTToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, secretKey, {
        expiresIn: 3 * 24 * 60 * 60,
    });
};
exports.createJWTToken = createJWTToken;
