import express, { Request, Response } from "express"
import { User } from "../models/user";
import { compare, hash } from "bcryptjs";
import { createJWTToken } from "../utils/utils";
const router = express.Router()

// signup route
router.post("/signup", async (req : Request, res:Response) => {
    try{
        const {name, userName, email, password} : {name: string, userName: string, email: string, password: string} = req.body;

        if(!name || !userName || !email || !password){
            return res.status(400).json({error: "Missing required fields"})
        }

        // check if userName is already taken
        const isUserNameTaken = await User.findOne({userName})

        if(isUserNameTaken){
            return res.status(400).json({error: "User name already taken"})
        }

        // check if user already exists
        const isUserExists = await User.findOne({email})

        if(isUserExists){
            return res.status(400).json({error: "User already exists"})
        }

        // if user dosent exists, create new user
        const hashedPassword = await hash(password, 10)

        const newUser = new User({name, userName, email, password: hashedPassword})
        await newUser.save()

        res.status(200).json({message: "User created successfully"})
    }
    catch(err){
        console.error(`Error creating user: ${err}`)
        res.status(500).json({error: "Internal Server Error"})
    }
})

// login route, using the JWT tokens
router.post("/login", async (req: Request, res: Response) => {
    try{
        const {email, password} : {email : string, password: string} = req.body;
        if(!email || !password){
            return res.status(400).json({error: "Missing required fields"})
        }
        const user = await User.findOne({email}).select("+password")
        // here add {password : 1} as by default the password is not returned

        if(!user){
            return res.status(400).json({error: "User not found"})
        }

        const isPasswordCorrect = await compare(password, user?.password as string)
        if(!isPasswordCorrect){
            return res.status(400).json({error: "Invalid credentials"})
        }

        const userToSend = {
            _id: user?._id,
            name: user?.name,
            userName: user?.userName,
            email: user?.email,
            role: user?.role,
            image : user?.image,
            bio : user?.bio,
            backgroundImg : user?.backgroundImg,
            followers : user?.followers?.length,
            following : user?.following?.length,
        }

        // if user exists and password is correct, generate JWT token
        const token = createJWTToken(user?._id as string)
        res.status(200).json({token, user : userToSend})
    }
    catch(error){
        console.error(`Error logging in: ${error}`)
        res.status(500).json({error: "Internal Server Error"})
    }
})

router.post("/updatePassowrd", async (req: Request, res: Response) => {
    try{
        const {email, newPassword, oldPassword} : {email : string, newPassword: string, oldPassword: string} = req.body;
        if(!email || !newPassword || !oldPassword){
            return res.status(400).json({error: "Missing required fields"})
        }
        const user = await User.findOne({email}).select("+password")
        // here add {password : 1} as by default the password is not returned

        if(!user){
            return res.status(400).json({error: "User not found"})
        }

        const isPasswordCorrect = await compare(oldPassword, user?.password as string)  
        if(!isPasswordCorrect){
            return res.status(400).json({error: "Invalid credentials"})
        }

        const hashedPassword = await hash(newPassword, 10)
        user.password = hashedPassword
        await user.save()

        res.status(200).json({message: "Password updated successfully"})
    }
    catch(error){
        console.error(`Error updating password: ${error}`)
        res.status(500).json({error: "Internal Server Error"})
    }

})

export default router