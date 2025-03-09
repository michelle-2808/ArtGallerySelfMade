// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    category: { 
      type: String, 
      required: true,
      enum: ['Painting', 'Sculpture', 'Photography', 'Digital Art', 'Prints', 'Mixed Media', 'Other']
    },
    tags: [{ type: String }],
    stockQuantity: { type: Number, required: true },
    isAvailable: { type: Boolean, required: true, default: true },
    featured: { type: Boolean, default: false },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
      depth: { type: Number },
      unit: { type: String, enum: ['cm', 'in'], default: 'cm' }
    },
    artist: { type: String },
    creationYear: { type: Number }
  },
  { timestamps: true }
);

// Add text index for search functionality
productSchema.index({ title: 'text', description: 'text', artist: 'text', tags: 'text' });

const Product = mongoose.model("Product", productSchema);
export default Product;
