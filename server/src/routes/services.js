import { Router } from "express";
import { Service } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../lib/validate.js";
import { schemas } from "../lib/schemas.js";
import { AppError, asyncHandler } from "../lib/errors.js";

const router = Router();

router.get(
  "/",
  authenticate,
  asyncHandler(async (_req, res) => {
    res.json(await Service.find({}));
  })
);

router.get(
  "/default",
  authenticate,
  asyncHandler(async (_req, res) => {
    let service = await Service.findOne({ isDefault: true });
    if (!service) {
      service = await Service.create({
        name: "Standard",
        priceSmall: 120,
        priceMedium: 180,
        priceLarge: 250,
        priceXL: 350,
        description: "Standard laundry service",
        isDefault: true,
      });
    }
    res.json(service);
  })
);

router.post(
  "/",
  requireRole("warden"),
  validate({ body: schemas.serviceCreate }),
  asyncHandler(async (req, res) => {
    const { name, priceSmall, priceMedium, priceLarge, priceXL, description, isDefault } =
      req.body;

    if (isDefault) {
      const all = await Service.find({});
      for (const service of all) {
        if (service.isDefault) {
          service.isDefault = false;
          await service.save();
        }
      }
    }

    const created = await Service.create({
      name,
      priceSmall,
      priceMedium,
      priceLarge,
      priceXL,
      description,
      isDefault: Boolean(isDefault),
    });
    res.status(201).json(created);
  })
);

router.patch(
  "/:id",
  requireRole("warden"),
  validate({ body: schemas.servicePatch }),
  asyncHandler(async (req, res) => {
    const existing = await Service.findOne({ _id: req.params.id });
    if (!existing) throw new AppError(404, "Service not found");

    if (req.body.isDefault && !existing.isDefault) {
      const all = await Service.find({});
      for (const service of all) {
        if (String(service._id) !== String(existing._id) && service.isDefault) {
          service.isDefault = false;
          await service.save();
        }
      }
    }

    for (const field of [
      "name",
      "priceSmall",
      "priceMedium",
      "priceLarge",
      "priceXL",
      "description",
      "isDefault",
    ]) {
      if (req.body[field] !== undefined) existing[field] = req.body[field];
    }

    await existing.save();
    res.json(existing);
  })
);

router.delete(
  "/:id",
  requireRole("warden"),
  asyncHandler(async (req, res) => {
    const existing = await Service.findOne({ _id: req.params.id });
    if (!existing) throw new AppError(404, "Service not found");
    if (existing.isDefault) {
      throw new AppError(400, "Cannot delete the default service tier");
    }

    await Service.findOneAndDelete({ _id: req.params.id });
    res.json({ message: "Service tier deleted" });
  })
);

router.post(
  "/:id/set-default",
  requireRole("warden"),
  asyncHandler(async (req, res) => {
    const existing = await Service.findOne({ _id: req.params.id });
    if (!existing) throw new AppError(404, "Service not found");

    const all = await Service.find({});
    for (const service of all) {
      if (String(service._id) !== String(existing._id) && service.isDefault) {
        service.isDefault = false;
        await service.save();
      }
    }

    existing.isDefault = true;
    await existing.save();
    res.json(existing);
  })
);

router.post(
  "/seed",
  requireRole("warden"),
  asyncHandler(async (_req, res) => {
    const all = await Service.find({});
    if (all.length > 0) return res.json(all[0]);

    const created = await Service.create({
      name: "Standard",
      priceSmall: 120,
      priceMedium: 180,
      priceLarge: 250,
      priceXL: 350,
      description: "Standard laundry service",
      isDefault: true,
    });
    return res.status(201).json(created);
  })
);

export default router;
