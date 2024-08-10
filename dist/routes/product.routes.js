"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controllers_1 = require("../controllers/product.controllers");
const router = express_1.default.Router();
// get all products
router.route("/").get(product_controllers_1.getAllProducts);
// get product by id
router.route("/productData/:id").get(product_controllers_1.getProductById);
// get all products of a brand
router.route("/user").get(product_controllers_1.getProductsByBrand);
// add a product
router.route("/").post(product_controllers_1.createProduct);
// edit product
router.route("/:id").put(product_controllers_1.editProduct);
// delete product
router.route("/:id").delete(product_controllers_1.deleteProduct);
exports.default = router;
