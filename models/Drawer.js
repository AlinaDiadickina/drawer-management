const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  description: {
    type: String,
  },
});

const drawerSchema = new mongoose.Schema({
  items: [itemSchema],
  toGet: [
    {
      type: String,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Drawer", drawerSchema);
