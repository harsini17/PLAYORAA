
const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
    path: path.join(__dirname, ".env")
});

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("PLAYORA Backend is Running!");
});

app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        console.log("Database URL:", process.env.MONGO_URI);

        await connectDB();

        console.log("Connected database:", require("mongoose").connection.name);

        app.listen(PORT, () => {
            console.log(`PLAYORA Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
    }
};

startServer();
