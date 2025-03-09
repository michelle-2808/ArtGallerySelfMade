// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Define product schema fields here
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true },
    stockQuantity: { type: Number, required: true },
    isAvailable: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
