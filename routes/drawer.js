const express = require("express");
const router = express.Router();
const Drawer = require("../models/Drawer");
const { protect } = require("../middleware/auth");

// @desc   Get all items in the authenticated user's drawer
// @route  GET /api/drawer
router.get("/", protect, async (req, res) => {
  try {
    // Find the drawer associated with the authenticated user
    const drawer = await Drawer.findOne({ user: req.user._id });
    if (!drawer) {
      return res.status(404).json({ message: "No items found" });
    }

    // Respond with the items in the drawer
    res.json(drawer.items);
  } catch (err) {
    // Handle server errors
    res.status(500).json({ message: err.message });
  }
});

// @desc   Get a specific item by ID from the drawer
// @route  GET /api/drawer/:id
router.get("/:id", protect, getDrawerItem, (req, res) => {
  // Respond with the item found by the getDrawerItem middleware
  res.json(res.drawerItem);
});

// @desc   Check if items in "To Get" list are in the drawer
// @route  GET /api/drawer/:id/to-get/check
router.get("/:id/to-get/check", protect, async (req, res) => {
  try {
    // Find the drawer by ID and ensure it belongs to the authenticated user
    const drawer = await Drawer.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!drawer) {
      return res.status(404).json({ message: "Drawer not found" });
    }

    // Compare each item in the "To Get" list with items in the drawer
    const comparisonResults = drawer.toGet.map((item) => {
      return {
        item: item,
        inDrawer: drawer.items.some(
          (drawerItem) => drawerItem.name.toLowerCase() === item.toLowerCase()
        ),
      };
    });

    // Respond with the comparison results
    res.json(comparisonResults);
  } catch (err) {
    // Handle server errors
    res.status(500).json({ message: err.message });
  }
});

// @desc   Create a new item in the drawer or update an existing one
// @route  POST /api/drawer
router.post("/", protect, async (req, res) => {
  const filteredBody = filterBody(req.body);

  try {
    // Find the drawer associated with the authenticated user
    let drawer = await Drawer.findOne({ user: req.user._id });

    // If the drawer doesn't exist, create a new one
    if (!drawer) {
      drawer = new Drawer({ user: req.user._id, items: [filteredBody] });
    } else {
      // Otherwise, add the item to the existing drawer
      drawer.items.push(filteredBody);
    }

    // Save the drawer and respond with the new item
    const newDrawerItem = await drawer.save();
    res.status(201).json(newDrawerItem);
  } catch (err) {
    // Handle validation or server errors
    res.status(400).json({ message: err.message });
  }
});

// @desc   Add items to the "To Get" list
// @route  POST /api/drawer/to-get
router.post("/to-get", protect, async (req, res) => {
  try {
    const itemsToGet = req.body.items;
    if (!itemsToGet || !Array.isArray(itemsToGet)) {
      return res.status(400).json({ message: "Invalid 'items' array" });
    }

    // Find the drawer associated with the authenticated user
    let drawer = await Drawer.findOne({ user: req.user._id });

    // If the drawer doesn't exist, create a new one with the "To Get" list
    if (!drawer) {
      drawer = new Drawer({ user: req.user._id, toGet: itemsToGet });
    } else {
      // Otherwise, update the "To Get" list
      drawer.toGet = [...new Set([...drawer.toGet, ...itemsToGet])];
    }

    // Save the drawer and respond with the updated "To Get" list
    await drawer.save();
    res.json(drawer.toGet);
  } catch (err) {
    // Handle server errors
    res.status(500).json({ message: err.message });
  }
});

// @desc   Update an existing item in the drawer by ID
// @route  PUT /api/drawer/:id
router.put("/:id", protect, async (req, res) => {
  try {
    // Find the drawer associated with the authenticated user
    const drawer = await Drawer.findOne({ user: req.user._id });

    if (!drawer) {
      return res.status(404).json({ message: "Drawer not found" });
    }

    // Find the item in the drawer by its ID
    const itemIndex = drawer.items.findIndex((item) =>
      item._id.equals(req.params.id)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Filter and update the item fields
    const filteredBody = filterBody(req.body);
    Object.assign(drawer.items[itemIndex], filteredBody);

    // Save the updated drawer and respond with the updated item
    await drawer.save();
    res.json(drawer.items[itemIndex]);
  } catch (err) {
    // Handle validation or server errors
    res.status(400).json({ message: err.message });
  }
});

// @desc   Increase the quantity of an item in the drawer by ID
// @route  PATCH /api/drawer/:id/increase
router.patch("/:id/increase", protect, async (req, res) => {
  try {
    // Find the drawer associated with the authenticated user
    const drawer = await Drawer.findOne({ user: req.user._id });

    if (!drawer) {
      return res.status(404).json({ message: "Drawer not found" });
    }

    // Find the item in the drawer by its ID
    const itemIndex = drawer.items.findIndex((item) =>
      item._id.equals(req.params.id)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Increase the quantity of the item
    const amount = parseInt(req.body.amount) || 1;
    drawer.items[itemIndex].quantity += amount;

    // Save the updated drawer and respond with the updated item
    await drawer.save();
    res.json(drawer.items[itemIndex]);
  } catch (err) {
    // Handle validation or server errors
    res.status(400).json({ message: err.message });
  }
});

// @desc   Decrease the quantity of an item in the drawer by ID
// @route  PATCH /api/drawer/:id/decrease
router.patch("/:id/decrease", protect, async (req, res) => {
  try {
    // Find the drawer associated with the authenticated user
    const drawer = await Drawer.findOne({ user: req.user._id });

    if (!drawer) {
      return res.status(404).json({ message: "Drawer not found" });
    }

    // Find the item in the drawer by its ID
    const itemIndex = drawer.items.findIndex((item) =>
      item._id.equals(req.params.id)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Decrease the quantity of the item
    const amount = parseInt(req.body.amount) || 1;
    const newQuantity = drawer.items[itemIndex].quantity - amount;

    if (newQuantity <= 0) {
      // If quantity drops to 0 or below, remove the item from the drawer
      drawer.items.splice(itemIndex, 1);
      await drawer.save();
      return res.json({ message: "Item removed from the drawer" });
    } else {
      // Otherwise, update the quantity
      drawer.items[itemIndex].quantity = newQuantity;
      await drawer.save();
      return res.json(drawer.items[itemIndex]);
    }
  } catch (err) {
    // Handle validation or server errors
    res.status(400).json({ message: err.message });
  }
});

// @desc   Delete an item from the drawer by ID
// @route  DELETE /api/drawer/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    // Find the drawer associated with the authenticated user
    const drawer = await Drawer.findOne({ user: req.user._id });

    if (!drawer) {
      return res.status(404).json({ message: "Drawer not found" });
    }

    // Find the item in the drawer by its ID
    const itemIndex = drawer.items.findIndex((item) =>
      item._id.equals(req.params.id)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Remove the item from the drawer
    drawer.items.splice(itemIndex, 1);

    // Save the updated drawer and respond with a success message
    await drawer.save();
    res.json({ message: "Item removed" });
  } catch (err) {
    // Handle server errors
    res.status(500).json({ message: err.message });
  }
});

// @desc   Middleware to get a drawer item by ID and ensure it belongs to the user
async function getDrawerItem(req, res, next) {
  let drawerItem;
  try {
    // Find the drawer item by ID
    drawerItem = await Drawer.findById(req.params.id);
    if (drawerItem == null) {
      return res.status(404).json({ message: "Cannot find item" });
    }
    // Ensure the item belongs to the authenticated user
    if (drawerItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
  } catch (err) {
    // Handle server errors
    return res.status(500).json({ message: err.message });
  }
  // Pass the item to the next middleware
  res.drawerItem = drawerItem;
  next();
}

// @desc   Utility function to filter allowed fields from the request body
function filterBody(body) {
  const allowedFields = ["name", "quantity", "description"];
  let filteredBody = {};
  for (let key of allowedFields) {
    if (body[key] !== undefined) {
      filteredBody[key] = body[key];
    }
  }
  return filteredBody;
}

module.exports = router;
