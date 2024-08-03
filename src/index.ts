import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import express from "express";
import { User } from "./models/user.model";
import { Venue } from "./models/venue.model";
import authRoutes from "./routes/auth.routes";
import conversationRoutes from "./routes/conversation.routes";
import imageRoutes from "./routes/images.routes";
import postRoutes from "./routes/posts.routes";
import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";
import venueRoutes from "./routes/venue.routes";
import cookieParser = require("cookie-parser");

import { checkNameAvailability, connectDB } from "./utils/utils";

const app = express();

const corsOptions: CorsOptions = {
  origin: ["http://localhost:3000", "https://notdoneyet.vercel.app", "*"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
dotenv.config();

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

connectDB();

// testing of the cookies part
app.get("/api/set-cookie/secure", (req, res) => {
  console.log(req.cookies)
  res.cookie("secureCookie", "1234", { httpOnly: true, secure: true, sameSite: "none" });
  res.send({ message: "Secure cookie set", cookies: req.cookies });
});

app.get("/set-cookie/insecure", (req, res) => {
  console.log(req.cookies)
  res.cookie("notSecure", "xxyzzz", { httpOnly: false, sameSite: "none", secure: true });
  res.send({ message: "Insecure cookie set", cookies: req.cookies });
})


app.get("/test-cookie", (req, res) => {
  console.log(req.cookies)
})

app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/venue", venueRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/product", productRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/auth", authRoutes)


app.get("/api/checkUserName", async (req, res) => {
  const { userName } = req.query;
  await checkNameAvailability(User, 'userName', userName as string, res);
});

app.get("/api/checkVenueName", async (req, res) => {
  const { uniqueName } = req.query;
  await checkNameAvailability(Venue, 'uniqueName', uniqueName as string, res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
