import express from "express";
import { Product } from "../models/product";
import { User } from "../models/user";
const router = express.Router();

// get all the products
router.get("/", async (_req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    console.error(`Error fetching products: ${err}`);
    res.status(500).json({ message: err });
  }
});

// get all products of user
router.get("/user", async (req, res) => {
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

    if (userName) {
      const user = await User.findOne({ userName })
        .select("products")
        .populate("products");
      userProducts = user?.products;
    } else if (userId) {
      const user = await User.findById(userId)
        .select("products")
        .populate("products");
      userProducts = user?.products;
    }
    res.status(200).json(userProducts);
  } catch (err) {
    console.error(`Error fetching products: ${err}`);
    res.status(500).json({ message: err });
  }
});

// add a product
router.post("/", async (req, res) => {
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
});

export default router;
