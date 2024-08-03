"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const images_controllers_1 = require("../controllers/images.controllers");
const router = express_1.default.Router();
router.get("/deleteImage", images_controllers_1.deleteImage);
router.get("/deleteFolder", images_controllers_1.deleteImagesFolder);
exports.default = router;
