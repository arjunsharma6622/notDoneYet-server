"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const utils_1 = require("./utils/utils");
const user_1 = __importDefault(require("./routes/user"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
(0, utils_1.connectDB)();
app.get("/", (_req, res) => {
    return res.send("Hello World");
});
app.use("/api/user", user_1.default);
app.listen(8000, () => {
    console.log(`Server running on port ${PORT}`);
});
