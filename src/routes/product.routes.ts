import express from "express";
import {
  createProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
  getProductById,
  getProductsByBrand
} from "../controllers/product.controllers";

const router = express.Router();

// get all the products
router.get("/", getAllProducts);

// get product by id
router.get("/productData/:id", getProductById);

// get all products of user
router.get("/user", getProductsByBrand);

// add a product
router.post("/", createProduct);

// edit product
router.put("/:id", editProduct);

// delete product
router.delete("/:id", deleteProduct);

export default router;