import Citizen from "../models/citizen.model.js";
import AuditLog from "../models/AuditLog.model.js";
import mongoose from "mongoose";
import { geocodeAddress } from "../utils/geocoderAddress.js";

/* CREATE CITIZEN */
export const createCitizen = async (req, res, next) => {
  try {
    const { fullName, nationalId, currentAddress } = req.body;
    if (!fullName || !nationalId || !currentAddress)
      return res.status(400).json({ message: "All fields required" });

    let { street, city, state, country, postalCode, latitude, longitude } =
      currentAddress;

    if (latitude == null || longitude == null) {
      const geo = await geocodeAddress({ street, city, state, country });
      latitude = geo.latitude;
      longitude = geo.longitude;
    }

    const citizen = await Citizen.create({
      fullName,
      nationalId,
      currentAddress: {
        street,
        city,
        state,
        country,
        postalCode,
        location: { type: "Point", coordinates: [longitude, latitude] },
        from: new Date(),
        to: null,
      },
    });

    await AuditLog.create({
      action: "CREATE",
      entity: "Citizen",
      entityId: citizen._id,
      performedBy: req.user.id,
    });

    return res.status(201).json({ message: "Citizen created", citizen });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* GET ALL CITIZENS (PAGINATION + FILTERING) */
export const getAllCitizen = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, city, state, isDeleted = false } = req.query;
    const query = { isDeleted: isDeleted === "true" };
    if (city) query["currentAddress.city"] = city;
    if (state) query["currentAddress.state"] = state;

    const citizens = await Citizen.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Citizen.countDocuments(query);

    return res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      results: citizens,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* GET CITIZEN BY ID */
export const getCitizenById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const citizen = await Citizen.findById(id);

    if (!citizen || citizen.isDeleted) {
      return res.status(404).json({ message: "Citizen not found" });
    }

    return res.status(200).json({ citizen });
  } catch (error) {
    next(error);
  }
};

/* UPDATE ADDRESS */
export const updateAddress = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { id } = req.params;
    const citizen = await Citizen.findById(id).session(session);

    if (!citizen || citizen.isDeleted) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Citizen not found" });
    }

    let { street, city, state, country, postalCode, latitude, longitude } =
      req.body;

    if (!street || !city || !state || !country) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Missing address fields" });
    }

    if (latitude == null || longitude == null) {
      const geo = await geocodeAddress({ street, city, state, country });
      if (!geo?.latitude || !geo?.longitude) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Failed to geocode address" });
      }
      latitude = geo.latitude;
      longitude = geo.longitude;
    }

    if (citizen.currentAddress) {
      citizen.pastAddresses.push({
        ...citizen.currentAddress.toObject(),
        to: new Date(),
      });
    }

    citizen.currentAddress = {
      street,
      city,
      state,
      country,
      postalCode,
      location: { type: "Point", coordinates: [longitude, latitude] },
      from: new Date(),
      to: null,
    };

    await citizen.save({ session });

    await AuditLog.create(
      [
        {
          action: "UPDATE_ADDRESS",
          entity: "Citizen",
          entityId: citizen._id,
          performedBy: req.user.id,
          metadata: { street, city, state, country, postalCode },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    // Return both current and past addresses
    return res.status(200).json({
      message: "Address updated",
      currentAddress: citizen.currentAddress,
      pastAddresses: citizen.pastAddresses,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    return res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

/* SOFT DELETE */
export const deleteCitizen = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const citizen = await Citizen.findById(req.params.id).session(session);
    if (!citizen || citizen.isDeleted) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Citizen not found" });
    }

    citizen.isDeleted = true;
    citizen.deletedAt = new Date();
    await citizen.save({ session });

    await AuditLog.create(
      [
        {
          action: "DELETE",
          entity: "Citizen",
          entityId: citizen._id,
          performedBy: req.user.id,
          metadata: { deletedAt: citizen.deletedAt },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return res.status(200).json({ message: "Citizen deleted" });
  } catch (err) {
    await session.abortTransaction();
    return res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

/* SEARCH BY CITY */
export const searchByCity = async (req, res, next) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ message: "City required" });

    const citizens = await Citizen.find({
      "currentAddress.city": city,
      isDeleted: false,
    });
    return res.status(200).json({ count: citizens.length, results: citizens });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* FIND NEARBY CITIZENS */
export const findNearbyCitizens = async (req, res, next) => {
  try {
    const { latitude, longitude, radiusKm = 5 } = req.query;
    if (!latitude || !longitude)
      return res
        .status(400)
        .json({ message: "Latitude and longitude required" });

    const citizens = await Citizen.find({
      "currentAddress.location": {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: radiusKm * 1000,
        },
      },
      isDeleted: false,
    });

    return res.status(200).json({ count: citizens.length, results: citizens });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
