import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: any) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await fn(req, res, next);
    }
    catch (error: any) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        })
    }
}

// export const asyncHandler = (requestHandler : any) => {
//     return (req : Request, res : Response, next : NextFunction) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
//     }
// }