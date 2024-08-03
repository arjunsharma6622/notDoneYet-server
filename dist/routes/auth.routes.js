"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controllers_1 = require("../controllers/auth.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// signup route
router.post("/signup", auth_controllers_1.signUp);
// login route, using the JWT tokens
router.route("/login").post(auth_controllers_1.login);
/* --- SECURED ROUTES --- */
//  update password
router.post("/updatePassowrd", auth_controllers_1.updatePassword);
// logout user
router.route("/logout").post(auth_middleware_1.verifyJWT, auth_controllers_1.logoutUser);
// refresh access token
router.route("/refreshToken").post(auth_controllers_1.refreshAccessToken);
exports.default = router;
