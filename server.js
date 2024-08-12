const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const drawerRoutes = require("./routes/drawer");
const authRoutes = require("./routes/auth");

const app = express();

app.use(bodyParser.json());

mongoose.connect(
  process.env.MONGO_URL || "mongodb://localhost:27017/drawerInventory",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use("/api/drawer", drawerRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
