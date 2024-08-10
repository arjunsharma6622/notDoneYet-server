import express from "express";
import {
  createProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
  getProductById,
  getProductsByBrand,
} from "../controllers/product.controllers";

const router = express.Router();

// get all products
router.route("/").get(getAllProducts);

// get product by id
router.route("/productData/:id").get(getProductById);

// get all products of a brand
router.route("/user").get(getProductsByBrand);

// add a product
router.route("/").post(createProduct);

// edit product
router.route("/:id").put(editProduct);

// delete product
router.route("/:id").delete(deleteProduct);

export default router;