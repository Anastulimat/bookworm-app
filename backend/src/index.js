import express from 'express';
import "dotenv/config";

import {connectDB} from "./lib/db.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
    console.info(`Server started on port ${PORT}`);
    connectDB();
})