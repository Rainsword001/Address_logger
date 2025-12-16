import express from "express";
import {
  createCitizen,
  getAllCitizen,
  getCitizenById,
  updateAddress,
  deleteCitizen,
  searchByCity,
  findNearbyCitizens,
} from "../controllers/citizen.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { geoLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Citizens
 *   description: Citizen address management
 */

router.post("/", requireAuth(["admin", "agent"]), createCitizen);
router.get("/", requireAuth(["admin", "agent", "viewer"]), getAllCitizen);
router.get("/:id", requireAuth(["admin", "agent", "viewer"]), getCitizenById);
router.put("/:id/address", requireAuth(["admin", "agent"]), updateAddress);
router.delete("/:id", requireAuth(["admin"]), deleteCitizen);
router.get(
  "/search/city",
  requireAuth(["admin", "agent", "viewer"]),
  searchByCity
);
router.get(
  "/search/nearby",
  geoLimiter,
  requireAuth(["admin", "agent", "viewer"]),
  findNearbyCitizens
);

export default router;
