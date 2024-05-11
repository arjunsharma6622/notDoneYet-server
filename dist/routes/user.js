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
const user_1 = require("../models/user");
const router = express_1.default.Router();
// get all users
router.get("/", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_1.User.find();
        res.status(200).json(users);
    }
    catch (err) {
        console.error(`Error fetching users: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// get user by id
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield user_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (err) {
        console.error(`Error fetching users: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// get user following
router.get("/following/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield user_1.User.findById(userId).populate("following");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const userFollowings = user.following;
        res.status(200).json(userFollowings);
    }
    catch (err) {
        console.error(`Error fetching users: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// get recommended users
router.get("/recommended/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield user_1.User.findById(userId).populate("following");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const userFollowings = user.following;
        userFollowings.push(userId);
        const recommendedUsers = yield user_1.User.find({ _id: { $nin: userFollowings } });
        res.status(200).json(recommendedUsers);
    }
    catch (err) {
        console.error(`Error fetching users: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
