import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    gridfsId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);

export default Image;