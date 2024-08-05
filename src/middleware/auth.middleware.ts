import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async (req : Request, res : Response, next : NextFunction) => {
    try{
        // either access token can come from the cookie (for browsers) or from Authorization header (for example for the mobile apps)
        
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

        console.log(req.cookies)

        if(!token){
            throw new ApiError(401, 'Unauthorized');
        }

        const decodedInfo : any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)

        const user = await User.findById(decodedInfo._id).select('-password').select('-refreshToken')

        if(!user){
            throw new ApiError(401, 'Invalid Access Token')
        }

        req.user = user;
        next();
    }
    catch(error : any){
        throw new ApiError(401, error?.message || 'Invalid access token')
    }
})