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
        // ?roles=user,admin,venue
        const { roles } = _req.query;
        if (roles) {
            const rolesArray = roles.toString().trim().split(',');
            const users = yield user_1.User.find({ role: { $in: rolesArray } });
            return res.status(200).json(users);
        }
        const users = yield user_1.User.find();
        res.status(200).json(users);
    }
    catch (err) {
        console.error(`Error fetching users: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// get user by id or userName using query
router.get("/getUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // ?userId=userId or ?userName=userName
        // console.log(req.query);
        const { userId, userName } = req.query;
        if (!userId && !userName) {
            return res.status(404).json({ error: "User not found" });
        }
        let user;
        if (userId) {
            user = yield user_1.User.findById(userId);
        }
        else if (userName) {
            user = yield user_1.User.findOne({ userName: userName });
        }
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
// get user Details using the userName and userRole from query
router.get("/profile/details", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { role, userName } = req.query;
        if (!role || !userName) {
            return res.status(404).json({ error: "User not found" });
        }
        const user = yield user_1.User.findOne({ role, userName });
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
        const recommendedUsers = yield user_1.User.find({
            _id: { $nin: userFollowings }, role: { $nin: ["admin", "venue"] }
        });
        res.status(200).json(recommendedUsers);
    }
    catch (err) {
        console.error(`Error fetching users: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// update user by userId
router.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const updates = req.body;
        const user = yield user_1.User.findByIdAndUpdate(userId, updates, { new: true });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (err) {
        console.error(`Error updating user: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// save post to user's saved posts
router.post("/post/toggleSavePost", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, postId } = req.body;
        let message = '';
        const user = yield user_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // check if post is already saved
        if (user.savedPosts.includes(postId)) {
            const finalPosts = user.savedPosts.filter((id) => id.toString() !== postId);
            user.savedPosts = finalPosts;
            message = 'Post removed from saved posts';
        }
        else {
            user.savedPosts.push(postId);
            message = 'Post added to saved posts';
        }
        yield user.save();
        res.status(200).json({ message });
    }
    catch (err) {
        console.error(`Error updating user: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
