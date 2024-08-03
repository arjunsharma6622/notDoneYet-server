"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controllers_1 = require("../controllers/product.controllers");
const router = express_1.default.Router();
// get all the products
router.get("/", product_controllers_1.getAllProducts);
// get product by id
router.get("/productData/:id", product_controllers_1.getProductById);
// get all products of user
router.get("/user", product_controllers_1.getProductsByBrand);
// add a product
router.post("/", product_controllers_1.createProduct);
// edit product
router.put("/:id", product_controllers_1.editProduct);
// delete product
router.delete("/:id", product_controllers_1.deleteProduct);
exports.default = router;
