import express from 'express';
import cors from 'cors';
import "dotenv/config";
import job from "./lib/cron.js";

import {connectDB} from "./lib/db.js";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

job.start();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);


app.listen(PORT, () => {
    console.info(`Server started on port ${PORT}`);
    connectDB();
})
