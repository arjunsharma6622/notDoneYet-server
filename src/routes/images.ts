import express from "express";
import { deleteImageFromCloudinary } from "../utils/utils";
const router = express.Router();
import { v2 as cloudinary } from "cloudinary";


router.get("/deleteImage", async (req, res) => {
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
});

router.get("/deleteFolder", async (req, res) => {
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
});



export default router;