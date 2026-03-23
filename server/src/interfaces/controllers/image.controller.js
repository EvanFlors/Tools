import Image from "../../domain/models/image.model.js";
import Product from "../../domain/models/product.model.js";
import {
  deleteImage,
  downloadImage,
  uploadImage,
} from "../../infrastructure/storage/image.service.js";

const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const image = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.status(201).json({
      message: "Image uploaded successfully",
      imageId: image._id,
      filename: image.filename,
    });
  } catch (error) {
    next(error);
  }
};

const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadPromises = req.files.map((file) =>
      uploadImage(file.buffer, file.originalname, file.mimetype)
    );

    const images = await Promise.all(uploadPromises);

    res.status(201).json({
      message: `${images.length} image(s) uploaded successfully`,
      images: images.map((img) => ({
        imageId: img._id,
        filename: img.filename,
        size: img.size,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const getImage = async (req, res, next) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    const buffer = await downloadImage(image.gridfsId);

    // Set CORS headers for images
    res.set("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Content-Type", image.contentType);
    res.set("Content-Length", image.size);
    res.set("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

const deleteProductImage = async (req, res, next) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Check if image is being used by any product
    const productUsingImage = await Product.findOne({ imageId: image._id });

    if (productUsingImage) {
      return res.status(400).json({
        error: "Cannot delete image. It is being used by a product",
      });
    }

    await deleteImage(image.gridfsId);

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadProductImage,
  uploadMultipleImages,
  getImage,
  deleteProductImage,
};
