import express from "express";
import {
  deleteImage,
  deleteImagesFolder
} from "../controllers/images.controllers";

const router = express.Router();

// Delete a single image
router.delete("/deleteImage", deleteImage);

// Delete an entire images folder
router.delete("/deleteFolder", deleteImagesFolder);

export default router;