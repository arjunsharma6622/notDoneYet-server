"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_1 = require("../models/product");
const user_1 = require("../models/user");
const router = express_1.default.Router();
// get all the products
router.get("/", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_1.Product.find();
        res.status(200).json(products);
    }
    catch (err) {
        console.error(`Error fetching products: ${err}`);
        res.status(500).json({ message: err });
    }
}));
// get all products of user
router.get("/user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId = null, userName = null;
        if (req.query.userId) {
            userId = req.query.userId;
        }
        else if (req.query.userName) {
            userName = req.query.userName;
        }
        if (!userId && !userName) {
            throw new Error("User ID or User Name is required");
        }
        let userProducts = null;
        if (userName) {
            const user = yield user_1.User.findOne({ userName })
                .select("products")
                .populate("products");
            userProducts = user === null || user === void 0 ? void 0 : user.products;
        }
        else if (userId) {
            const user = yield user_1.User.findById(userId)
                .select("products")
                .populate("products");
            userProducts = user === null || user === void 0 ? void 0 : user.products;
        }
        res.status(200).json(userProducts);
    }
    catch (err) {
        console.error(`Error fetching products: ${err}`);
        res.status(500).json({ message: err });
    }
}));
// add a product
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productBody = req.body;
        const product = new product_1.Product(Object.assign(Object.assign({}, productBody), { pricing: {
                presentPrice: productBody.presentPrice,
                originalPrice: productBody.originalPrice,
            } }));
        yield product.save();
        if (product) {
            // push the product in the user
            const user = yield user_1.User.findById(productBody.user);
            user === null || user === void 0 ? void 0 : user.products.push(product._id);
            yield (user === null || user === void 0 ? void 0 : user.save());
        }
        res.status(201).json(product);
    }
    catch (err) {
        console.error(`Error adding product: ${err}`);
        res.status(500).json({ message: err });
    }
}));
// edit product
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.params.id;
        const productBody = req.body;
        const product = yield product_1.Product.findByIdAndUpdate(productId, productBody, { new: true });
        res.status(200).json(product);
    }
    catch (err) {
        console.error(`Error editing product: ${err}`);
        res.status(500).json({ message: err });
    }
}));
// delete product
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //remove product
        const productId = req.params.id;
        const product = yield product_1.Product.findByIdAndDelete(productId);
        //remove product from user
        const user = yield user_1.User.findById(product === null || product === void 0 ? void 0 : product.user);
        user === null || user === void 0 ? void 0 : user.products.pull(productId);
        yield (user === null || user === void 0 ? void 0 : user.save());
        res.status(200).json(product);
    }
    catch (err) {
        console.error(`Error deleting product: ${err}`);
        res.status(500).json({ message: err });
    }
}));
exports.default = router;
