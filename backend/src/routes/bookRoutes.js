import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middlewares/auth.middleware.js";

// ----------------------------------------------------------------------

const router = express.Router();

// ----------------------------------------------------------------------

router.post("/", protectRoute, async (req, res) => {
    try {
        const {title, caption, rating, image} = req.body;
        if (!title || !caption || !rating || !image) {
            return res.status(400).json({
                message: "please provide all fields"
            });
        }

        // Upload the image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;


        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id,
        });

        await newBook.save();

        res.status(201).json(newBook)

    } catch (error) {
        console.log("Internal Server Error: ", error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
});


export default router;