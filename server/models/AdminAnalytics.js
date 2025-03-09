
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
    weeklyStats: [{
      week: String, // Format: YYYY-WW
      views: { type: Number, default: 0 },
      purchases: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    }],
    categoryPerformance: {
      type: Map,
      of: {
        views: { type: Number, default: 0 },
        purchases: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 }
      }
    }
  },
  { timestamps: true }
);

// Index for quick lookups by productId
adminAnalyticsSchema.index({ productId: 1 });

const AdminAnalytics = mongoose.model("AdminAnalytics", adminAnalyticsSchema);
export default AdminAnalytics;
