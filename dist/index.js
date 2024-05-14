"use strict";
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
app.listen(8000, () => {
    console.log(`Server running on port ${PORT}`);
});
