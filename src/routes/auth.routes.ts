import express from "express";
import {
    login,
    logoutUser,
    refreshAccessToken,
    signUp,
    updatePassword
} from "../controllers/auth.controllers";
import { verifyJWT } from "../middleware/auth.middleware";

const router = express.Router()

// signup route
router.post("/signup", signUp)

// login route, using the JWT tokens
router.route("/login").post(login)

/* --- SECURED ROUTES --- */

//  update password
router.post("/updatePassowrd", updatePassword)

// logout user
router.route("/logout").post(verifyJWT, logoutUser)

// refresh access token
router.route("/refreshToken").post(refreshAccessToken)

export default router