const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
require("dotenv").config();

const projectRoutes = require("./routes/projectRoutes");
const siteRoutes = require("./routes/siteRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const filterRoutes = require("./routes/filterRoutes")
const cookieParser = require("cookie-parser");

const app = express();
connectDB();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use("/api/projects", projectRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/inventories", inventoryRoutes);
app.use("/api/filter",filterRoutes)
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);



const PORT = 5000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor.`));
