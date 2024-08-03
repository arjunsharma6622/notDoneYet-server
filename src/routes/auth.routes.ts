import express from "express";
import {
    login,
    signUp,
    updatePassword
} from "../controllers/auth.controllers";

const router = express.Router()

// signup route
router.post("/signup", signUp)

// login route, using the JWT tokens
router.post("/login", login)

//  update password
router.post("/updatePassowrd", updatePassword)

export default router