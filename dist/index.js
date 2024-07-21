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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const user_1 = require("./models/user");
const venue_1 = require("./models/venue");
const conversation_1 = __importDefault(require("./routes/conversation"));
const images_1 = __importDefault(require("./routes/images"));
const posts_1 = __importDefault(require("./routes/posts"));
const product_1 = __importDefault(require("./routes/product"));
const user_2 = __importDefault(require("./routes/user"));
const venue_2 = __importDefault(require("./routes/venue"));
const utils_1 = require("./utils/utils");
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
app.use("/api/user", user_2.default);
app.use("/api/posts", posts_1.default);
app.use("/api/venue", venue_2.default);
app.use("/api/conversation", conversation_1.default);
app.use("/api/product", product_1.default);
app.use("/api/images", images_1.default);
app.get("/api/checkUserName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName } = req.query;
    yield (0, utils_1.checkNameAvailability)(user_1.User, 'userName', userName, res);
}));
app.get("/api/checkVenueName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uniqueName } = req.query;
    yield (0, utils_1.checkNameAvailability)(venue_1.Venue, 'uniqueName', uniqueName, res);
}));
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
