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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const user_1 = require("./models/user");
const venue_1 = require("./models/venue");
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth2_1 = require("passport-google-oauth2");
const conversation_1 = __importDefault(require("./routes/conversation"));
const images_1 = __importDefault(require("./routes/images"));
const posts_1 = __importDefault(require("./routes/posts"));
const product_1 = __importDefault(require("./routes/product"));
const user_2 = __importDefault(require("./routes/user"));
const auth_1 = __importDefault(require("./routes/auth"));
const venue_2 = __importDefault(require("./routes/venue"));
const utils_1 = require("./utils/utils");
const app = (0, express_1.default)();
const corsOptions = {
    origin: ["http://localhost:3000", "https://notdoneyet.vercel.app", ""],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
dotenv_1.default.config();
//set up session
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
passport_1.default.use(new passport_google_oauth2_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/callback/google",
    scope: ["profile", "email"]
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(profile);
        let user = yield user_1.User.findOne({ googleId: profile.id });
        if (!user) {
            user = new user_1.User({
                googleId: profile.id,
                name: profile.displayName,
                userName: profile.email.split("@")[0],
                email: profile.email,
                image: profile.picture
            });
            yield user.save();
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, false);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => {
    done(null, user);
});
// initialize googleAuth Login
app.get("/auth/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/callback/google", passport_1.default.authenticate("google", {
    successRedirect: "http://localhost:3000/dashboard",
    failureRedirect: "http://localhost:3000/login"
}));
const PORT = process.env.PORT || 8000;
(0, utils_1.connectDB)();
app.use("/api/user", user_2.default);
app.use("/api/posts", posts_1.default);
app.use("/api/venue", venue_2.default);
app.use("/api/conversation", conversation_1.default);
app.use("/api/product", product_1.default);
app.use("/api/images", images_1.default);
app.use("/api/auth", auth_1.default);
app.get("/api/checkUserName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName } = req.query;
    yield (0, utils_1.checkNameAvailability)(user_1.User, 'userName', userName, res);
}));
app.get("/api/checkVenueName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uniqueName } = req.query;
    yield (0, utils_1.checkNameAvailability)(venue_1.Venue, 'uniqueName', uniqueName, res);
}));
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
