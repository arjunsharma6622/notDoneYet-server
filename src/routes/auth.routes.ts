import express from "express";
import {
    checkAccessToken,
    googleOauthHandler,
    login,
    logoutUser,
    mobileGoogleOauthHandler,
    refreshAccessToken,
    signUp,
    updatePassword
} from "../controllers/auth.controllers";
import { verifyJWT } from "../middleware/auth.middleware";

const router = express.Router()

router.route("/signup").post(signUp)

// login route, using the JWT tokens
router.route("/login").post(login)

router.get("/google", googleOauthHandler);

router.post("/mobileAppGoogle", mobileGoogleOauthHandler);

/* --- SECURED ROUTES --- */

//  update password
router.route("/updatePassowrd").post(updatePassword)

// logout user
router.route("/logout").post(logoutUser)

// refresh access token
router.route("/refreshAccessToken").post(refreshAccessToken)

// check accessToken validity
router.route("/checkAccessToken").get(verifyJWT, checkAccessToken)

export default router