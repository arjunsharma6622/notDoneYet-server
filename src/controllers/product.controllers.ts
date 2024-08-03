import { Request, Response } from "express";
import { Product } from "../models/product.model";
import { User } from "../models/user.model";

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        console.error(`Error fetching products: ${err}`);
        res.status(500).json({ message: err });
    }
}

export const getProductById = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        res.status(200).json(product);
    } catch (err) {
        console.error(`Error fetching product: ${err}`);
        res.status(500).json({ message: err });
    }
}

export const getProductsByBrand = async (req: Request, res: Response) => {
    try {
        let userId = null,
            userName = null;
        if (req.query.userId) {
            userId = req.query.userId;
        } else if (req.query.userName) {
            userName = req.query.userName;
        }

        if (!userId && !userName) {
            throw new Error("User ID or User Name is required");
        }

        let userProducts = null;
        let user: any = null;

        if (userName) {
            user = await User.findOne({ userName })
                .select("userName products")
                .populate("products");
            userProducts = user?.products;
        } else if (userId) {
            user = await User.findById(userId)
                .select("userName products")
                .populate("products");
            userProducts = user?.products;
        }

        // Adding brandUserName to all the products
        if (userProducts && user) {
            userProducts = userProducts.map((product: any) => ({
                ...product.toObject(), // convert mongoose document to plain object
                brandUserName: user?.userName,
            }));
        }

        res.status(200).json(userProducts);
    } catch (err) {
        console.error(`Error fetching products: ${err}`);
        res.status(500).json({ message: err });
    }
}

export const createProduct = async (req: Request, res: Response) => {
    try {
        const productBody: any = req.body;
        const product = new Product({
            ...productBody,
            pricing: {
                presentPrice: productBody.presentPrice,
                originalPrice: productBody.originalPrice,
            },
        });
        await product.save();
        if (product) {
            // push the product in the user
            const user: any = await User.findById(productBody.user);
            user?.products.push(product._id);
            await user?.save();
        }
        res.status(201).json(product);
    } catch (err) {
        console.error(`Error adding product: ${err}`);
        res.status(500).json({ message: err });
    }
}

export const editProduct = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const productBody: any = req.body;
        const product = await Product.findByIdAndUpdate(productId, productBody, {
            new: true,
        });
        res.status(200).json(product);
    } catch (err) {
        console.error(`Error editing product: ${err}`);
        res.status(500).json({ message: err });
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        //remove product
        const productId = req.params.id;
        const product = await Product.findByIdAndDelete(productId);
        //remove product from user
        const user: any = await User.findById(product?.user);
        user?.products.pull(productId);
        await user?.save();
        res.status(200).json(product);
    } catch (err) {
        console.error(`Error deleting product: ${err}`);
        res.status(500).json({ message: err });
    }
}