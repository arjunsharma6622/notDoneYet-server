import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import { deleteImageFromCloudinary } from "../utils/utils";


export const deleteImage = async (req: Request, res: Response) => {
    try {
        const { imageUrl } = req.query;
        if (!imageUrl) {
            return res.status(400).json({ error: "Image URL is required" });
        }
        const cldRes = await deleteImageFromCloudinary({
            secureUrl: imageUrl as string,
        });
        return res.status(200).json({ ...cldRes, message: "Image deleted successfully" });
    } catch (err) {
        console.error(`Error deleting image: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const deleteImagesFolder = async (req: Request, res: Response) => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        const { folderName } = req.query;
        console.log(folderName);
        if (!folderName) {
            return res.status(400).json({ error: "Folder Name is required" });
        }
        const cldRes = await cloudinary.api.delete_resources_by_prefix(
            "my_folder/"
        );
        console.log(cldRes);
        return res.status(200).json({ ...cldRes, message: "Folder deleted successfully" });
    } catch (err) {
        console.error(`Error deleting folder: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}