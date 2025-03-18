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

router.get("/", protectRoute, async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;


        const books = await Book.find()
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileImage");

        const totalBooks = await Book.countDocuments();

        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });

    } catch (error) {
        console.log("Error in get all books route", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            res.status(404).json({
                message: "Book not found"
            });
        }

        if (book.user.toString() !== req.user._id.toString()) {
            res.status(401).json({
                message: "You are not authorized"
            });
        }

        // Delete image from cloudinary
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.log("Error deleting image from cloudinary");
            }
        }

        await book.deleteOne();

        res.status(200).json({
            message: "Book deleted successfully"
        });

    } catch (error) {
        console.log("Error deleting book", error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
});

router.get("/user", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({user: req.user._id}).sort({createdAt: -1});
        res.status(200).json(books);
    } catch (error) {
        console.log("Get user books error", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
})


export default router;