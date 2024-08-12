const express = require("express");
const router = express.Router();
const Drawer = require("../models/Drawer");
const { protect } = require("../middleware/auth");

router.get("/", protect, async (req, res) => {
  try {
    const drawer = await Drawer.findOne({ user: req.user._id });
    if (!drawer) {
      return res.status(404).json({ message: "No items found" });
    }
    res.json(drawer.items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", protect, getDrawerItem, (req, res) => {
  res.json(res.drawerItem);
});

router.get("/:id/to-get/check", protect, async (req, res) => {
  try {
    const drawer = await Drawer.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!drawer) {
      return res.status(404).json({ message: "Drawer not found" });
    }

    const comparisonResults = drawer.toGet.map((item) => {
      return {
        item: item,
        inDrawer: drawer.items.some(
          (drawerItem) => drawerItem.name.toLowerCase() === item.toLowerCase()
        ),
      };
    });

    res.json(comparisonResults);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", protect, async (req, res) => {
  const filteredBody = filterBody(req.body);

  try {
    let drawer = await Drawer.findOne({ user: req.user._id });

    if (!drawer) {
      drawer = new Drawer({ user: req.user._id, items: [filteredBody] });
    } else {
      drawer.items.push(filteredBody);
    }

    const newDrawerItem = await drawer.save();
    res.status(201).json(newDrawerItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/to-get", protect, async (req, res) => {
  try {
    const itemsToGet = req.body.items;
    if (!itemsToGet || !Array.isArray(itemsToGet)) {
      return res.status(400).json({ message: "Invalid 'items' array" });
    }

    let drawer = await Drawer.findOne({ user: req.user._id });

    if (!drawer) {
      drawer = new Drawer({ user: req.user._id, toGet: itemsToGet });
    } else {
      drawer.toGet = [...new Set([...drawer.toGet, ...itemsToGet])];
    }

    await drawer.save();
    res.json(drawer.toGet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const drawer = await Drawer.findOne({ user: req.user._id });

    if (!drawer) {
      return res.status(404).json({ message: "Drawer not found" });
    }

    const itemIndex = drawer.items.findIndex((item) =>
      item._id.equals(req.params.id)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    const filteredBody = filterBody(req.body);

    Object.assign(drawer.items[itemIndex], filteredBody);

    await drawer.save();

    res.json(drawer.items[itemIndex]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/:id/increase", protect, async (req, res) => {
  try {
    const drawer = await Drawer.findOne({ user: req.user._id });

    if (!drawer) {
      return res.status(404).json({ message: "Drawer not found" });
    }

    const itemIndex = drawer.items.findIndex((item) =>
      item._id.equals(req.params.id)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    const amount = parseInt(req.body.amount) || 1;
    drawer.items[itemIndex].quantity += amount;

    await drawer.save();
    res.json(drawer.items[itemIndex]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/:id/decrease", protect, async (req, res) => {
  try {
    const drawer = await Drawer.findOne({ user: req.user._id });

    if (!drawer) {
      return res.status(404).json({ message: "Drawer not found" });
    }

    const itemIndex = drawer.items.findIndex((item) =>
      item._id.equals(req.params.id)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    const amount = parseInt(req.body.amount) || 1;
    const newQuantity = drawer.items[itemIndex].quantity - amount;

    if (newQuantity <= 0) {
      drawer.items.splice(itemIndex, 1);
      await drawer.save();
      return res.json({ message: "Item removed from the drawer" });
    } else {
      drawer.items[itemIndex].quantity = newQuantity;
      await drawer.save();
      return res.json(drawer.items[itemIndex]);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const drawer = await Drawer.findOne({ user: req.user._id });

    if (!drawer) {
      return res.status(404).json({ message: "Drawer not found" });
    }

    const itemIndex = drawer.items.findIndex((item) =>
      item._id.equals(req.params.id)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    drawer.items.splice(itemIndex, 1);

    await drawer.save();
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getDrawerItem(req, res, next) {
  let drawerItem;
  try {
    drawerItem = await Drawer.findById(req.params.id);
    if (drawerItem == null) {
      return res.status(404).json({ message: "Cannot find item" });
    }
    if (drawerItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.drawerItem = drawerItem;
  next();
}

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
