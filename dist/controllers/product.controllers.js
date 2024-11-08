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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.editProduct = exports.createProduct = exports.getProductsByBrand = exports.getProductById = exports.getAllProducts = void 0;
const product_model_1 = require("../models/product.model");
const user_model_1 = require("../models/user.model");
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_model_1.Product.find();
        res.status(200).json(products);
    }
    catch (err) {
        console.error(`Error fetching products: ${err}`);
        res.status(500).json({ message: err });
    }
});
exports.getAllProducts = getAllProducts;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.params.id;
        const product = yield product_model_1.Product.findById(productId);
        res.status(200).json(product);
    }
    catch (err) {
        console.error(`Error fetching product: ${err}`);
        res.status(500).json({ message: err });
    }
});
exports.getProductById = getProductById;
const getProductsByBrand = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        let user = null;
        if (userName) {
            user = yield user_model_1.User.findOne({ userName })
                .select("userName products")
                .populate("products");
            userProducts = user === null || user === void 0 ? void 0 : user.products;
        }
        else if (userId) {
            user = yield user_model_1.User.findById(userId)
                .select("userName products")
                .populate("products");
            userProducts = user === null || user === void 0 ? void 0 : user.products;
        }
        // Adding brandUserName to all the products
        if (userProducts && user) {
            userProducts = userProducts.map((product) => (Object.assign(Object.assign({}, product.toObject()), { brandUserName: user === null || user === void 0 ? void 0 : user.userName })));
        }
        res.status(200).json(userProducts);
    }
    catch (err) {
        console.error(`Error fetching products: ${err}`);
        res.status(500).json({ message: err });
    }
});
exports.getProductsByBrand = getProductsByBrand;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productBody = req.body;
        const product = new product_model_1.Product(Object.assign(Object.assign({}, productBody), { pricing: {
                presentPrice: productBody.presentPrice,
                originalPrice: productBody.originalPrice,
            } }));
        yield product.save();
        if (product) {
            // push the product in the user
            const user = yield user_model_1.User.findById(productBody.user);
            user === null || user === void 0 ? void 0 : user.products.push(product._id);
            yield (user === null || user === void 0 ? void 0 : user.save());
        }
        res.status(201).json(product);
    }
    catch (err) {
        console.error(`Error adding product: ${err}`);
        res.status(500).json({ message: err });
    }
});
exports.createProduct = createProduct;
const editProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.params.id;
        const productBody = req.body;
        const product = yield product_model_1.Product.findByIdAndUpdate(productId, productBody, {
            new: true,
        });
        res.status(200).json(product);
    }
    catch (err) {
        console.error(`Error editing product: ${err}`);
        res.status(500).json({ message: err });
    }
});
exports.editProduct = editProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //remove product
        const productId = req.params.id;
        const product = yield product_model_1.Product.findByIdAndDelete(productId);
        //remove product from user
        const user = yield user_model_1.User.findById(product === null || product === void 0 ? void 0 : product.user);
        user === null || user === void 0 ? void 0 : user.products.pull(productId);
        yield (user === null || user === void 0 ? void 0 : user.save());
        res.status(200).json(product);
    }
    catch (err) {
        console.error(`Error deleting product: ${err}`);
        res.status(500).json({ message: err });
    }
});
exports.deleteProduct = deleteProduct;
