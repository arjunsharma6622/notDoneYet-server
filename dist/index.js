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
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const utils_1 = require("./utils/utils");
const user_1 = __importDefault(require("./routes/user"));
const posts_1 = __importDefault(require("./routes/posts"));
const venue_1 = __importDefault(require("./routes/venue"));
const conversation_1 = __importDefault(require("./routes/conversation"));
const product_1 = __importDefault(require("./routes/product"));
const cors_1 = __importDefault(require("cors"));
const user_2 = require("./models/user");
const venue_2 = require("./models/venue");
const app = (0, express_1.default)();
const corsOptions = {
    origin: ["http://localhost:3000", "https://notdoneyet.vercel.app"],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
dotenv_1.default.config();
const PORT = process.env.PORT || 8000;
(0, utils_1.connectDB)();
app.get("/", (_req, res) => {
    return res.send("Hello World");
});
app.use("/api/user", user_1.default);
app.use("/api/posts", posts_1.default);
app.use("/api/venue", venue_1.default);
app.use("/api/conversation", conversation_1.default);
app.use("/api/product", product_1.default);
app.get("/api/checkUserName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userName } = req.query;
        if (!userName) {
            return res.status(400).json({ error: "User Name is required" });
        }
        const user = yield user_2.User.findOne({ userName });
        if (user) {
            return res
                .status(200)
                .json({ message: "User Name is already taken", available: false });
        }
        return res
            .status(200)
            .json({ message: "User Name is available", available: true });
    }
    catch (err) {
        console.error(`Error fetching users: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// check unique name available
app.get("/api/checkVenueName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ error: "Venue Name is required" });
        }
        const venue = yield venue_2.Venue.findOne({ name });
        if (venue) {
            return res
                .status(200)
                .json({ message: "Venue Name is already taken", available: false });
        }
        return res
            .status(200)
            .json({ message: "Venue Name is available", available: true });
    }
    catch (err) {
        console.error(`Error fetching venues: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/api/images/deleteImage", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { imageUrl } = req.query;
        if (!imageUrl) {
            return res.status(400).json({ error: "Image URL is required" });
        }
        const cldRes = yield (0, utils_1.deleteImageFromCloudinary)({ secureUrl: imageUrl });
        return res.status(200).json(Object.assign(Object.assign({}, cldRes), { message: "Image deleted successfully" }));
    }
    catch (err) {
        console.error(`Error deleting image: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.listen(8000, () => {
    console.log(`Server running on port ${PORT}`);
});
