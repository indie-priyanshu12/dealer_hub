import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import VehicleImage from '../models/VehicleImage.js';

const SORTABLE_FIELDS = ['price', 'year', 'make', 'model', 'mileage'];

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export const searchVehicles = async (req, res) => {
  try {
    const { search, category, fuelType, minPrice, maxPrice, sortBy, order } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (fuelType) filter.fuelType = { $regex: fuelType, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sort = SORTABLE_FIELDS.includes(sortBy)
      ? { [sortBy]: order === 'desc' ? -1 : 1 }
      : { createdAt: -1 };

    const vehicles = await Vehicle.find(filter).sort(sort);

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export const getVehicleImage = async (req, res) => {
  try {
    const { id, index } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle id'
      });
    }

    const imageIndex = Number(index);
    if (!Number.isInteger(imageIndex) || imageIndex < 1) {
      return res.status(400).json({
        success: false,
        error: 'Image index must be a positive integer'
      });
    }

    const image = await VehicleImage.findOne({ vehicle: id, index: imageIndex });

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // Immutable-ish inventory photos: let browsers cache them for a day instead of
    // re-downloading megabytes of JPEG on every inventory visit.
    res.set('Cache-Control', 'public, max-age=86400');
    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

const UPLOAD_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/avif', 'image/webp']);
const MAX_UPLOAD_COUNT = 12;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

// Validates and decodes the optional `imageUploads` request field
// ([{ contentType, data(base64) }]) BEFORE any writes happen, so a bad payload can
// never leave behind a half-created vehicle. Returns decoded buffers or throws a
// message intended for a 400 response.
const decodeImageUploads = (imageUploads) => {
  if (imageUploads === undefined) return [];
  if (!Array.isArray(imageUploads) || imageUploads.length > MAX_UPLOAD_COUNT) {
    throw new Error(`imageUploads must be an array of at most ${MAX_UPLOAD_COUNT} images`);
  }
  return imageUploads.map((upload, i) => {
    const { contentType, data } = upload || {};
    if (!UPLOAD_CONTENT_TYPES.has(contentType)) {
      throw new Error(`Image ${i + 1}: unsupported content type`);
    }
    if (typeof data !== 'string' || data.length === 0 || data.length % 4 !== 0 || !BASE64_PATTERN.test(data)) {
      throw new Error(`Image ${i + 1}: data must be valid base64`);
    }
    const buffer = Buffer.from(data, 'base64');
    if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
      throw new Error(`Image ${i + 1}: decoded image is empty or exceeds ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB`);
    }
    return { contentType, buffer };
  });
};

export const createVehicle = async (req, res) => {
  try {
    const { imageUploads, ...vehicleFields } = req.body;

    let uploads;
    try {
      uploads = decodeImageUploads(imageUploads);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError.message
      });
    }

    const vehicle = await Vehicle.create(vehicleFields);

    // Same storage shape the seed script produces: binaries in VehicleImage, the
    // vehicle's image/images fields pointing at the public serving endpoint.
    if (uploads.length > 0) {
      await VehicleImage.insertMany(uploads.map(({ contentType, buffer }, i) => ({
        vehicle: vehicle._id,
        index: i + 1,
        contentType,
        data: buffer,
      })));
      const urls = uploads.map((_, i) => `/api/vehicles/${vehicle._id}/images/${i + 1}`);
      vehicle.image = urls[0];
      vehicle.images = urls;
      await vehicle.save();
    }

    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    if (error.name === 'ValidationError' || error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: error.code === 11000
          ? 'A vehicle with this ID already exists'
          : error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export const purchaseVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    if (vehicle.stock <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Vehicle is out of stock'
      });
    }

    vehicle.stock -= 1;
    await vehicle.save();

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export const restockVehicle = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a positive integer'
      });
    }

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    vehicle.stock += quantity;
    await vehicle.save();

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true, context: 'query' }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
