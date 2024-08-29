import axios from 'axios';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import qs from "querystring";
import { User } from '../models/user.model';
import { UserDocument } from '../types/user.types';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { cookieOptions } from '../utils/utils';

const generateAccessAndRefreshTokens = async (userId: string) => {
    try {
        const user = await User.findById(userId)

        if (!user) throw new ApiError(404, "User not found")

        const accessToken = user?.generateAccessToken();
        const refreshToken = user?.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save()

        return { accessToken, refreshToken }
    }
    catch (err: any) {
        console.log(err)
        throw new ApiError(500, "Something went wrong, while generating refresh annd access tokens");
    }
}

const generateAccessToken = async (userId: string) => {
    try {
        const user = await User.findById(userId)

        if (!user) throw new ApiError(404, "User not found")

        const accessToken = user?.generateAccessToken();

        return accessToken
    }
    catch (err: any) {
        console.log(err)
        throw new ApiError(500, "Something went wrong, while generating access token");
    }
}

// google service for getting tokens using the code
const getGoogleOauthTokens = async (code: string) => {
    const url = "https://oauth2.googleapis.com/token"
    const values = {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
        grant_type: "authorization_code"
    }

    try {
        const res = await axios.post(url, qs.stringify(values), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        return res.data
    }
    catch (err) {
        console.log("Failed to fetch Google Oauth Tokens, " + err)
        throw new ApiError(500, "Failed to fetch Google Oauth Tokens")
    }
}

// google login for mobile
export const mobileGoogleOauthHandler = (async (req: any, res: Response) => {
    try {
        const id_token = req.body.id_token
        const googleUserData : any = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`)

        // 4. add the user
        const { name, email, picture, email_verified } = googleUserData.data

        const userName = email.split("@")[0]

        if (!email_verified) throw new ApiError(400, "Google Email is not verified")

        let user: UserDocument | null = await User.findOne({ email })

        // check if there is a user, if there is no user with same email then create a new user
        if (!user && email) {
            const newUser = new User({
                name,
                userName,
                email,
                image: picture,
            })

            await newUser.save()

            user = newUser
        }

        // 5. create access and refresh tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user?._id.toString())

        const userToSend = {
            _id: user?._id.toString(),
            name: user?.name,
            userName: user?.userName,
            email: user?.email,
            role: user?.role,
            image: user?.image,
            bio: user?.bio,
            backgroundImg: user?.backgroundImg,
            followers: user?.followers?.length,
            following: user?.following?.length,
        }
    
        res.status(200).json(new ApiResponse(200, { user: userToSend, accessToken, refreshToken }, "User logged In Successfully"))
    } catch (err) {
        console.log(err)
        res.redirect(`${process.env.CLIENT_HEAD}/login`)
    }
})

export const googleOauthHandler = (async (req: any, res: Response) => {
    try {
        // 1. get the code from the query string
        const code = req.query.code as string


        // 2. get the ID and access token with the code
        const { id_token, access_token } = await getGoogleOauthTokens(code)

        // 3. get the user with tokens
        const googleUserData = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
            headers: {
                Authorization: `Bearer ${id_token}`
            }
        })

        // 4. add the user
        const { name, email, picture, verified_email, googleId } = googleUserData.data

        const userName = email.split("@")[0]

        if (!verified_email) throw new ApiError(400, "Google Email is not verified")

        let user: UserDocument | null = await User.findOne({ email })

        // check if there is a user, if there is no user with same email then create a new user
        if (!user && verified_email) {
            const newUser = new User({
                name,
                userName,
                email,
                image: picture,
                googleId
            })

            await newUser.save()

            user = newUser
        }

        // if a user with same email already exits then it means that user is authenticated by google, so we dont need to reauthenticate using the password, so simply generate the tokens
        // 5. create access and refresh tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user?._id.toString())

        // 6. set the cookies
        res.cookie("accessToken", accessToken, cookieOptions)
        res.cookie("refreshToken", refreshToken, cookieOptions)

        // 7. redirect back to client
        res.redirect(`${process.env.CLIENT_HEAD}/login`)
    } catch (err) {
        console.log(err)
        res.redirect(`${process.env.CLIENT_HEAD}/login`)
    }
})

export const checkAccessToken = asyncHandler(async (req: any, res: Response) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { accessToken: req?.user?.accessToken },
                "Access token is valid"
            )
        )
})

export const signUp = asyncHandler(async (req: Request, res: Response) => {
    const { name, userName, email, password }: { name: string, userName: string, email: string, password: string } = req.body;

    if (!name || !userName || !email || !password) {
        throw new ApiError(400, "Missing required fields")
    }

    // check if userName is already taken
    const isUserNameTaken = await User.findOne({ userName })

    if (isUserNameTaken) {
        throw new ApiError(400, "User name already taken")
    }

    // check if user already exists
    const isUserExists = await User.findOne({ email })

    if (isUserExists) {
        throw new ApiError(400, "User already exists")
    }

    // if user dosent exists, create new user
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({ name, userName, email, password: hashedPassword })
    await newUser.save()

    return res
        .status(201)
        .json(new ApiResponse(201, { user: newUser }, "User created successfully"))
})

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password }: { email: string, password: string } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Missing required fields")
    }
    const user = await User.findOne({ email }).select("+password")
    // include password here as in the default main user schema, the password select is set to false, so for the isPasswordCorrect method we need to include it here

    if (!user?.password) {
        throw new ApiError(400, "Looks like you have signed up with Google")
    }

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid credentials")
    }

    // generate access token and refresh token, and send the cookie
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id.toString())

    const userToSend = {
        _id: user?._id.toString(),
        name: user?.name,
        userName: user?.userName,
        email: user?.email,
        role: user?.role,
        image: user?.image,
        bio: user?.bio,
        backgroundImg: user?.backgroundImg,
        followers: user?.followers?.length,
        following: user?.following?.length,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, { ...cookieOptions, expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), maxAge: 15 * 24 * 60 * 60 * 1000 })
        .cookie("refreshToken", refreshToken, { ...cookieOptions, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), maxAge: 30 * 24 * 60 * 60 * 1000 },)
        .json(new ApiResponse(200, { user: userToSend, accessToken, refreshToken }, "User logged In Successfully"))
})

export const logoutUser = asyncHandler(async (req: any, res: Response) => {
    //clear the cookies and remove the refresh token, this is being used as a secured route, so after executin the verifyJWT middlware we can access user from req.user
    // const updatedUser = await User.findByIdAndUpdate(req.user?._id, { $set: { refreshToken: undefined } }, { new: true }).select("+refreshToken")

    await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { refreshToken: "" } },
        { new: true }
    ).select("+refreshToken");

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(200,
                { message: "User logged out successfully" },
                "User logged out successfully"
            )
        )
})

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, newPassword, oldPassword }: { email: string, newPassword: string, oldPassword: string } = req.body;
    if (!email || !newPassword || !oldPassword) {
        throw new ApiError(400, "Missing required fields")
    }
    const user = await User.findOne({ email }).select("+password")
    // here add {password : 1} as by default the password is not returned

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user?.password as string)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()

    return res
        .status(200)
        .json(new ApiResponse(200, { message: "Password updated successfully" }, "Password updated successfully"))
})

export const refreshAccessToken = asyncHandler(async (req: any, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request")

    // catch the decoded errors, either by using a try catch of using it's callback function
    // i did it using the callback function because it's easier to use the throw new ApiError in the callback function

    const decodedToken: any = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
        (err: any, decoded: any) => {
            if (err) {
                throw new ApiError(401, "Invalid refresh token")
            }
            return decoded
        }
    )

    const user = await User.findById(decodedToken?._id)

    if (!user) throw new ApiError(401, "Invalid refresh token")

    if (incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, "Refresh token is expired or used")

    // const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id.toString())
    // here dont generate both access and refresh token becuase it will be a never ending loop of access and refresh token, you can generate both at the initial auth login, but when you need to refresh the access token you need to generate the refresh token only

    const accessToken = await generateAccessToken(user._id.toString())

    return res
        .status(200)
        .cookie("accessToken", accessToken, { ...cookieOptions },)
        .json(
            new ApiResponse(
                200,
                { accessToken },
                "Access token refreshed"
            )
        )
})