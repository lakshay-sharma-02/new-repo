import { Router } from "express";
import { Service } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/services — list all service tiers (public-ish, needs auth)
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const all = await Service.find({});
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/services/default — get the default service tier
 */
router.get("/default", authenticate, async (req, res) => {
  try {
    let s = await Service.findOne({ isDefault: true });
    if (!s) {
      // Auto-create a default if none exists
      s = await Service.create({
        name: "Standard",
        priceSmall: 120,
        priceMedium: 180,
        priceLarge: 250,
        priceXL: 350,
        description: "Standard laundry service",
        isDefault: true,
      });
    }
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/services — create a new service tier (warden only)
 */
router.post("/", requireRole("warden"), async (req, res) => {
  try {
    const { name, priceSmall, priceMedium, priceLarge, priceXL, description, isDefault } = req.body;
    if (!name) return res.status(400).json({ error: "Service name is required" });

    // If setting as default, unset others
    if (isDefault) {
      await Service.findOneAndUpdate({ isDefault: true }, { isDefault: false });
    }

    const service = await Service.create({
      name,
      priceSmall: Number(priceSmall) || 120,
      priceMedium: Number(priceMedium) || 180,
      priceLarge: Number(priceLarge) || 250,
      priceXL: Number(priceXL) || 350,
      description: description || "",
      isDefault: !!isDefault,
    });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/services/:id — update service tier (warden only)
 */
router.patch("/:id", requireRole("warden"), async (req, res) => {
  try {
    const { name, priceSmall, priceMedium, priceLarge, priceXL, description, isDefault } = req.body;
    const existing = await Service.findOne({ _id: req.params.id });
    if (!existing) return res.status(404).json({ error: "Service not found" });

    if (isDefault && !existing.isDefault) {
      await Service.findOneAndUpdate({ isDefault: true, _id: { $ne: existing._id } }, { isDefault: false });
    }

    if (name !== undefined) existing.name = name;
    if (priceSmall !== undefined) existing.priceSmall = Number(priceSmall);
    if (priceMedium !== undefined) existing.priceMedium = Number(priceMedium);
    if (priceLarge !== undefined) existing.priceLarge = Number(priceLarge);
    if (priceXL !== undefined) existing.priceXL = Number(priceXL);
    if (description !== undefined) existing.description = description;
    if (isDefault !== undefined) existing.isDefault = !!isDefault;

    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/services/:id — delete service tier (warden only, can't delete default)
 */
router.delete("/:id", requireRole("warden"), async (req, res) => {
  try {
    const existing = await Service.findOne({ _id: req.params.id });
    if (!existing) return res.status(404).json({ error: "Service not found" });
    if (existing.isDefault) {
      return res.status(400).json({ error: "Cannot delete the default service tier" });
    }
    await Service.findOneAndDelete({ _id: req.params.id });
    res.json({ message: "Service tier deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/services/:id/set-default — mark as default (warden only)
 */
router.post("/:id/set-default", requireRole("warden"), async (req, res) => {
  try {
    const existing = await Service.findOne({ _id: req.params.id });
    if (!existing) return res.status(404).json({ error: "Service not found" });

    await Service.findOneAndUpdate({ isDefault: true, _id: { $ne: existing._id } }, { isDefault: false });
    existing.isDefault = true;
    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/services/seed — seed a default service tier if none exist (admin/warden)
 */
router.post("/seed", requireRole("warden"), async (req, res) => {
  try {
    const all = await Service.find({});
    if (all.length === 0) {
      const s = await Service.create({
        name: "Standard",
        priceSmall: 120,
        priceMedium: 180,
        priceLarge: 250,
        priceXL: 350,
        description: "Standard laundry service",
        isDefault: true,
      });
      return res.status(201).json(s);
    }
    res.json(all[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
