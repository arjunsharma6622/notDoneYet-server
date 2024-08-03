import express from "express";
import {
  deleteImage,
  deleteImagesFolder
} from "../controllers/images.controllers";

const router = express.Router();

router.get("/deleteImage", deleteImage);

router.get("/deleteFolder", deleteImagesFolder);

export default router;