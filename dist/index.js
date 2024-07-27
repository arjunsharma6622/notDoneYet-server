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
const auth_1 = __importDefault(require("./routes/auth"));
const conversation_1 = __importDefault(require("./routes/conversation"));
const images_1 = __importDefault(require("./routes/images"));
const posts_1 = __importDefault(require("./routes/posts"));
const product_1 = __importDefault(require("./routes/product"));
const user_2 = __importDefault(require("./routes/user"));
const venue_2 = __importDefault(require("./routes/venue"));
const utils_1 = require("./utils/utils");
const app = (0, express_1.default)();
const corsOptions = {
    origin: ["http://localhost:3000", "https://notdoneyet.vercel.app", "*"],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
dotenv_1.default.config();
//set up session
// app.use(session({
//   secret: process.env.SESSION_SECRET_KEY as string,
//   resave: false,
//   saveUninitialized: true,
// }))
// app.use(passport.initialize())
// app.use(passport.session())
// passport.use(
//   new OAuth2Strategy({
//     clientID: process.env.GOOGLE_CLIENT_ID as string,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//     callbackURL: "/auth/callback/google",
//     scope: ["profile", "email"]
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try{
//       console.log(profile)
//       let user = await User.findOne({googleId: profile.id})
//       if(!user){
//         user = new User({
//           googleId: profile.id,
//           name: profile.displayName,
//           userName: profile.email.split("@")[0],
//           email: profile.email,
//           image: profile.picture
//         })
//         await user.save()
//       }
//       return done(null, user)
//     }catch(error){
//       return done(error, false)
//     }
//   })
// )
// passport.serializeUser((user, done) => {
//   done(null, user as any)
// })
// passport.deserializeUser((user, done) => {
//   done(null, user as any)
// })
// initialize googleAuth Login
// app.get("/auth/google", passport.authenticate("google", {scope: ["profile", "email"]}))
// app.get("/auth/callback/google", passport.authenticate("google", {
//   successRedirect : "http://localhost:3000/dashboard",
//   failureRedirect : "http://localhost:3000/login"
// }))
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
