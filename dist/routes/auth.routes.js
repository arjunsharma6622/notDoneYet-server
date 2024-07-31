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
const express_1 = __importDefault(require("express"));
const user_model_1 = require("../models/user.model");
const bcryptjs_1 = require("bcryptjs");
const utils_1 = require("../utils/utils");
const router = express_1.default.Router();
// signup route
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, userName, email, password } = req.body;
        if (!name || !userName || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // check if userName is already taken
        const isUserNameTaken = yield user_model_1.User.findOne({ userName });
        if (isUserNameTaken) {
            return res.status(400).json({ error: "User name already taken" });
        }
        // check if user already exists
        const isUserExists = yield user_model_1.User.findOne({ email });
        if (isUserExists) {
            return res.status(400).json({ error: "User already exists" });
        }
        // if user dosent exists, create new user
        const hashedPassword = yield (0, bcryptjs_1.hash)(password, 10);
        const newUser = new user_model_1.User({ name, userName, email, password: hashedPassword });
        yield newUser.save();
        res.status(200).json({ message: "User created successfully" });
    }
    catch (err) {
        console.error(`Error creating user: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// login route, using the JWT tokens
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const user = yield user_model_1.User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        const isPasswordCorrect = yield user.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const userToSend = {
            _id: user === null || user === void 0 ? void 0 : user._id,
            name: user === null || user === void 0 ? void 0 : user.name,
            userName: user === null || user === void 0 ? void 0 : user.userName,
            email: user === null || user === void 0 ? void 0 : user.email,
            role: user === null || user === void 0 ? void 0 : user.role,
            image: user === null || user === void 0 ? void 0 : user.image,
            bio: user === null || user === void 0 ? void 0 : user.bio,
            backgroundImg: user === null || user === void 0 ? void 0 : user.backgroundImg,
            followers: (_a = user === null || user === void 0 ? void 0 : user.followers) === null || _a === void 0 ? void 0 : _a.length,
            following: (_b = user === null || user === void 0 ? void 0 : user.following) === null || _b === void 0 ? void 0 : _b.length,
        };
        // if user exists and password is correct, generate JWT token
        const token = (0, utils_1.createJWTToken)(user === null || user === void 0 ? void 0 : user._id);
        res.status(200).json({ token, user: userToSend });
    }
    catch (error) {
        console.error(`Error logging in: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
router.post("/updatePassowrd", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, newPassword, oldPassword } = req.body;
        if (!email || !newPassword || !oldPassword) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const user = yield user_model_1.User.findOne({ email }).select("+password");
        // here add {password : 1} as by default the password is not returned
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        const isPasswordCorrect = yield (0, bcryptjs_1.compare)(oldPassword, user === null || user === void 0 ? void 0 : user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const hashedPassword = yield (0, bcryptjs_1.hash)(newPassword, 10);
        user.password = hashedPassword;
        yield user.save();
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        console.error(`Error updating password: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
