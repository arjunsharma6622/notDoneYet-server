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
const utils_1 = require("../utils/utils");
const router = express_1.default.Router();
const cloudinary_1 = require("cloudinary");
router.get("/deleteImage", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { imageUrl } = req.query;
        if (!imageUrl) {
            return res.status(400).json({ error: "Image URL is required" });
        }
        const cldRes = yield (0, utils_1.deleteImageFromCloudinary)({
            secureUrl: imageUrl,
        });
        return res.status(200).json(Object.assign(Object.assign({}, cldRes), { message: "Image deleted successfully" }));
    }
    catch (err) {
        console.error(`Error deleting image: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
router.get("/deleteFolder", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        const { folderName } = req.query;
        console.log(folderName);
        if (!folderName) {
            return res.status(400).json({ error: "Folder Name is required" });
        }
        const cldRes = yield cloudinary_1.v2.api.delete_resources_by_prefix("my_folder/");
        console.log(cldRes);
        return res.status(200).json(Object.assign(Object.assign({}, cldRes), { message: "Folder deleted successfully" }));
    }
    catch (err) {
        console.error(`Error deleting folder: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
