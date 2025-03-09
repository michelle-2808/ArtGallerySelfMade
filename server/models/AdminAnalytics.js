
// models/AdminAnalytics.js
import mongoose from "mongoose";

const adminAnalyticsSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    viewCount: { 
      type: Number, 
      default: 0 
    },
    purchaseCount: { 
      type: Number, 
      default: 0 
    },
    revenue: { 
      type: Number, 
      default: 0 
    },
    lastUpdated: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Adding indexes for efficient querying
adminAnalyticsSchema.index({ productId: 1 });

const AdminAnalytics = mongoose.model("AdminAnalytics", adminAnalyticsSchema);
export default AdminAnalytics;
