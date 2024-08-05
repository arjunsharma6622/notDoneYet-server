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
exports.refreshAccessToken = exports.updatePassword = exports.logoutUser = exports.login = exports.signUp = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../models/user.model");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("../utils/utils");
const generateAccessAndRefreshTokens = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(userId);
        if (!user)
            throw new ApiError_1.ApiError(404, "User not found");
        const accessToken = user === null || user === void 0 ? void 0 : user.generateAccessToken();
        const refreshToken = user === null || user === void 0 ? void 0 : user.generateRefreshToken();
        user.refreshToken = refreshToken;
        yield user.save();
        return { accessToken, refreshToken };
    }
    catch (err) {
        console.log(err);
        throw new ApiError_1.ApiError(500, "Something went wrong, while generating refresh annd access tokens");
    }
});
exports.signUp = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, userName, email, password } = req.body;
    if (!name || !userName || !email || !password) {
        throw new ApiError_1.ApiError(400, "Missing required fields");
    }
    // check if userName is already taken
    const isUserNameTaken = yield user_model_1.User.findOne({ userName });
    if (isUserNameTaken) {
        throw new ApiError_1.ApiError(400, "User name already taken");
    }
    // check if user already exists
    const isUserExists = yield user_model_1.User.findOne({ email });
    if (isUserExists) {
        throw new ApiError_1.ApiError(400, "User already exists");
    }
    // if user dosent exists, create new user
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    const newUser = new user_model_1.User({ name, userName, email, password: hashedPassword });
    yield newUser.save();
    return res
        .status(201)
        .json(new ApiResponse_1.ApiResponse(201, { user: newUser }, "User created successfully"));
}));
exports.login = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError_1.ApiError(400, "Missing required fields");
    }
    const user = yield user_model_1.User.findOne({ email }).select("+password");
    // include password here as in the default main user schema, the password select is set to false, so for the isPasswordCorrect method we need to include it here
    if (!user) {
        throw new ApiError_1.ApiError(404, "User not found");
    }
    const isPasswordCorrect = yield user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError_1.ApiError(400, "Invalid credentials");
    }
    // generate access token and refresh token, and send the cookie
    const { accessToken, refreshToken } = yield generateAccessAndRefreshTokens(user._id.toString());
    const userToSend = {
        _id: user === null || user === void 0 ? void 0 : user._id.toString(),
        name: user === null || user === void 0 ? void 0 : user.name,
        userName: user === null || user === void 0 ? void 0 : user.userName,
        email: user === null || user === void 0 ? void 0 : user.email,
        role: user === null || user === void 0 ? void 0 : user.role,
        image: user === null || user === void 0 ? void 0 : user.image,
        bio: user === null || user === void 0 ? void 0 : user.bio,
        backgroundImg: user === null || user === void 0 ? void 0 : user.backgroundImg,
        followers: (_a = user === null || user === void 0 ? void 0 : user.followers) === null || _a === void 0 ? void 0 : _a.length,
        following: (_b = user === null || user === void 0 ? void 0 : user.following) === null || _b === void 0 ? void 0 : _b.length,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, Object.assign(Object.assign({}, utils_1.cookieOptions), { expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) }))
        .cookie("refreshToken", refreshToken, Object.assign(Object.assign({}, utils_1.cookieOptions), { expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }))
        .json(new ApiResponse_1.ApiResponse(200, { user: userToSend, accessToken, refreshToken }, "User logged In Successfully"));
}));
exports.logoutUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //clear the cookies and remove the refresh token, this is being used as a secured route, so after executin the verifyJWT middlware we can access user from req.user
    // const updatedUser = await User.findByIdAndUpdate(req.user?._id, { $set: { refreshToken: undefined } }, { new: true }).select("+refreshToken")
    var _c;
    yield user_model_1.User.findByIdAndUpdate((_c = req.user) === null || _c === void 0 ? void 0 : _c._id, { $set: { refreshToken: "" } }, { new: true }).select("+refreshToken");
    return res
        .status(200)
        .clearCookie("accessToken", utils_1.cookieOptions)
        .clearCookie("refreshToken", utils_1.cookieOptions)
        .json(new ApiResponse_1.ApiResponse(200, { message: "User logged out successfully" }, "User logged out successfully"));
}));
exports.updatePassword = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, newPassword, oldPassword } = req.body;
    if (!email || !newPassword || !oldPassword) {
        throw new ApiError_1.ApiError(400, "Missing required fields");
    }
    const user = yield user_model_1.User.findOne({ email }).select("+password");
    // here add {password : 1} as by default the password is not returned
    if (!user) {
        throw new ApiError_1.ApiError(404, "User not found");
    }
    const isPasswordCorrect = yield bcryptjs_1.default.compare(oldPassword, user === null || user === void 0 ? void 0 : user.password);
    if (!isPasswordCorrect) {
        throw new ApiError_1.ApiError(400, "Old password is incorrect");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
    user.password = hashedPassword;
    yield user.save();
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { message: "Password updated successfully" }, "Password updated successfully"));
}));
exports.refreshAccessToken = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken)
        throw new ApiError_1.ApiError(401, "Unauthorized request");
    const decodedToken = jsonwebtoken_1.default.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = yield user_model_1.User.findById(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken._id);
    if (!user)
        throw new ApiError_1.ApiError(401, "Invalid refresh token");
    if (incomingRefreshToken !== (user === null || user === void 0 ? void 0 : user.refreshToken))
        throw new ApiError_1.ApiError(401, "Refresh token is expired or used");
    const { accessToken, refreshToken: newRefreshToken } = yield generateAccessAndRefreshTokens(user._id.toString());
    return res
        .status(200)
        .cookie("accessToken", accessToken, Object.assign(Object.assign({}, utils_1.cookieOptions), { expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) }))
        .cookie("refreshToken", newRefreshToken, Object.assign(Object.assign({}, utils_1.cookieOptions), { expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }))
        .json(new ApiResponse_1.ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
}));
