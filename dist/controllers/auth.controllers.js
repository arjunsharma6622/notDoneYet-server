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
exports.refreshAccessToken = exports.updatePassword = exports.logoutUser = exports.login = exports.signUp = exports.checkAccessToken = exports.googleOauthHandler = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../models/user.model");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("../utils/utils");
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
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
const generateAccessToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(userId);
        if (!user)
            throw new ApiError_1.ApiError(404, "User not found");
        const accessToken = user === null || user === void 0 ? void 0 : user.generateAccessToken();
        return accessToken;
    }
    catch (err) {
        console.log(err);
        throw new ApiError_1.ApiError(500, "Something went wrong, while generating access token");
    }
});
// google service for getting tokens using the code
const getGoogleOauthTokens = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const url = "https://oauth2.googleapis.com/token";
    const values = {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
        grant_type: "authorization_code"
    };
    try {
        const res = yield axios_1.default.post(url, querystring_1.default.stringify(values), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return res.data;
    }
    catch (err) {
        console.log("Failed to fetch Google Oauth Tokens, " + err);
        throw new ApiError_1.ApiError(500, "Failed to fetch Google Oauth Tokens");
    }
});
exports.googleOauthHandler = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. get the code from the query string
        const code = req.query.code;
        // 2. get the ID and access token with the code
        const { id_token, access_token } = yield getGoogleOauthTokens(code);
        // 3. get the user with tokens
        const googleUserData = yield axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
            headers: {
                Authorization: `Bearer ${id_token}`
            }
        });
        // 4. add the user
        const { name, email, picture, verified_email, googleId } = googleUserData.data;
        const userName = email.split("@")[0];
        if (!verified_email)
            throw new ApiError_1.ApiError(400, "Google Email is not verified");
        let user = yield user_model_1.User.findOne({ email });
        // check if there is a user, if there is no user with same email then create a new user
        if (!user && verified_email) {
            const newUser = new user_model_1.User({
                name,
                userName,
                email,
                image: picture,
                googleId
            });
            yield newUser.save();
            user = newUser;
        }
        // if a user with same email already exits then it means that user is authenticated by google, so we dont need to reauthenticate using the password, so simply generate the tokens
        // 5. create access and refresh tokens
        const { accessToken, refreshToken } = yield generateAccessAndRefreshTokens(user === null || user === void 0 ? void 0 : user._id.toString());
        // 6. set the cookies
        res.cookie("accessToken", accessToken, utils_1.cookieOptions);
        res.cookie("refreshToken", refreshToken, utils_1.cookieOptions);
        // 7. redirect back to client
        res.redirect(`${process.env.CLIENT_HEAD}/login`);
    }
    catch (err) {
        console.log(err);
        res.redirect(`${process.env.CLIENT_HEAD}/login`);
    }
}));
exports.checkAccessToken = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { accessToken: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.accessToken }, "Access token is valid"));
}));
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
    var _b, _c;
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError_1.ApiError(400, "Missing required fields");
    }
    const user = yield user_model_1.User.findOne({ email }).select("+password");
    // include password here as in the default main user schema, the password select is set to false, so for the isPasswordCorrect method we need to include it here
    if (!(user === null || user === void 0 ? void 0 : user.password)) {
        throw new ApiError_1.ApiError(400, "Looks like you have signed up with Google");
    }
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
        followers: (_b = user === null || user === void 0 ? void 0 : user.followers) === null || _b === void 0 ? void 0 : _b.length,
        following: (_c = user === null || user === void 0 ? void 0 : user.following) === null || _c === void 0 ? void 0 : _c.length,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, Object.assign(Object.assign({}, utils_1.cookieOptions), { expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), maxAge: 15 * 24 * 60 * 60 * 1000 }))
        .cookie("refreshToken", refreshToken, Object.assign(Object.assign({}, utils_1.cookieOptions), { expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), maxAge: 30 * 24 * 60 * 60 * 1000 }))
        .json(new ApiResponse_1.ApiResponse(200, { user: userToSend, accessToken, refreshToken }, "User logged In Successfully"));
}));
exports.logoutUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //clear the cookies and remove the refresh token, this is being used as a secured route, so after executin the verifyJWT middlware we can access user from req.user
    // const updatedUser = await User.findByIdAndUpdate(req.user?._id, { $set: { refreshToken: undefined } }, { new: true }).select("+refreshToken")
    var _d;
    yield user_model_1.User.findByIdAndUpdate((_d = req.user) === null || _d === void 0 ? void 0 : _d._id, { $set: { refreshToken: "" } }, { new: true }).select("+refreshToken");
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
    // catch the decoded errors, either by using a try catch of using it's callback function
    // i did it using the callback function because it's easier to use the throw new ApiError in the callback function
    const decodedToken = jsonwebtoken_1.default.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            throw new ApiError_1.ApiError(401, "Invalid refresh token");
        }
        return decoded;
    });
    const user = yield user_model_1.User.findById(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken._id);
    if (!user)
        throw new ApiError_1.ApiError(401, "Invalid refresh token");
    if (incomingRefreshToken !== (user === null || user === void 0 ? void 0 : user.refreshToken))
        throw new ApiError_1.ApiError(401, "Refresh token is expired or used");
    // const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id.toString())
    // here dont generate both access and refresh token becuase it will be a never ending loop of access and refresh token, you can generate both at the initial auth login, but when you need to refresh the access token you need to generate the refresh token only
    const accessToken = yield generateAccessToken(user._id.toString());
    return res
        .status(200)
        .cookie("accessToken", accessToken, Object.assign({}, utils_1.cookieOptions))
        .json(new ApiResponse_1.ApiResponse(200, { accessToken }, "Access token refreshed"));
}));
