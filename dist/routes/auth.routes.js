"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controllers_1 = require("../controllers/auth.controllers");
const router = express_1.default.Router();
// signup route
router.post("/signup", auth_controllers_1.signUp);
// login route, using the JWT tokens
router.post("/login", auth_controllers_1.login);
//  update password
router.post("/updatePassowrd", auth_controllers_1.updatePassword);
exports.default = router;
