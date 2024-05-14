"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// define the schema for the product
const productSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    images: [{ type: String, required: true }],
    category: { type: String, required: true },
    tags: [{ type: String }],
    gender: { type: String, enum: ["male", "female", "unisex"], required: true },
    description: { type: String, required: true },
    ratings: { type: Number, default: 0 },
    stock: [
        {
            size: { type: String, required: true },
            quantity: { type: Number, default: 0 },
        },
    ],
    totalStock: { type: Number, default: 0 },
    pricing: {
        originalPrice: { type: Number, required: true },
        presentPrice: { type: Number, required: true },
        discount: { type: Number, default: 0 },
    },
    sizes: [{ type: String }],
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }
});
// middleware to calculate the discount price before saving the product
productSchema.pre('save', function (next) {
    // calc discount
    const originalPrice = this.pricing.originalPrice;
    const presentPrice = this.pricing.presentPrice;
    const discount = ((originalPrice - presentPrice) / originalPrice) * 100;
    // roundoff discount to 2 decimals
    this.pricing.discount = parseFloat(discount.toFixed(2));
    // update the total stock
    this.totalStock = this.stock.reduce((acc, curr) => acc + curr.quantity, 0);
    next();
});
// create the models
const Product = mongoose_1.default.model("Product", productSchema);
exports.Product = Product;
