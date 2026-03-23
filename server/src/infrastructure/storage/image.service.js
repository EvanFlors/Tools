import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import Image from "../../domain/models/image.model.js";

let bucket;

const initBucket = () => {
  if (!bucket) {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }
    bucket = new GridFSBucket(db, {
      bucketName: "images"
    });
  }
  return bucket;
};

const uploadImage = async (buffer, filename, contentType) => {
  const gridBucket = initBucket();

  return new Promise((resolve, reject) => {
    const uploadStream = gridBucket.openUploadStream(filename, {
      contentType,
      metadata: {
        uploadedAt: new Date()
      }
    });

    uploadStream.on("error", (error) => {
      console.error("GridFS upload error:", error);
      reject(new Error("Failed to upload image"));
    });

    uploadStream.on("finish", async () => {
      try {
        // Access file information from the stream itself
        const fileId = uploadStream.id;
        const fileLength = uploadStream.length || buffer.length;

        const image = await Image.create({
          filename: filename,
          contentType,
          size: fileLength,
          gridfsId: fileId
        });

        resolve(image);
      } catch (error) {
        console.error("Image document creation error:", error);
        // Cleanup GridFS file if document creation fails
        try {
          await gridBucket.delete(uploadStream.id);
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError);
        }
        reject(new Error("Failed to save image metadata"));
      }
    });

    uploadStream.end(buffer);
  });
};

const downloadImage = async (gridfsId) => {
  const gridBucket = initBucket();

  return new Promise((resolve, reject) => {
    const chunks = [];
    const downloadStream = gridBucket.openDownloadStream(
      new mongoose.Types.ObjectId(gridfsId)
    );

    downloadStream.on("data", (chunk) => chunks.push(chunk));

    downloadStream.on("error", (error) => {
      console.error("GridFS download error:", error);
      reject(new Error("Failed to download image"));
    });

    downloadStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });
};

const deleteImage = async (gridfsId) => {
  const gridBucket = initBucket();

  try {
    // Delete from GridFS
    await gridBucket.delete(new mongoose.Types.ObjectId(gridfsId));

    // Delete from Image collection
    await Image.findOneAndDelete({ gridfsId });
  } catch (error) {
    console.error("Image deletion error:", error);
    throw new Error("Failed to delete image");
  }
};

const imageExists = async (gridfsId) => {
  const gridBucket = initBucket();

  try {
    const files = await gridBucket
      .find({ _id: new mongoose.Types.ObjectId(gridfsId) })
      .toArray();
    return files.length > 0;
  } catch (error) {
    console.error("Image exists check error:", error);
    return false;
  }
};

export {
  uploadImage,
  downloadImage,
  deleteImage,
  imageExists
};