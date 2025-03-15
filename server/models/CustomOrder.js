import mongoose from "mongoose";

// Pre-save hook to generate order number
const generateOrderNumber = function (next) {
  if (!this.orderNumber) {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.orderNumber = `CUST-${timestamp}-${random}`;
  }
  next();
};

const customOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    productDetails: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      specifications: { type: String },
      customizations: { type: String },
      expectedPrice: { type: Number },
      attachments: [{ type: String }], // URLs to uploaded images/files (including reference images)
    },
    customerInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      otpVerified: { type: Boolean, default: false },
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "in_production", "completed"],
      default: "pending",
    },
    adminNotes: { type: String },
    approvedPrice: { type: Number },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Generate order number
customOrderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.orderNumber = `CUST-${timestamp}-${random}`;
  }
  next();
});

customOrderSchema.pre("save", generateOrderNumber);

const CustomOrder = mongoose.model("CustomOrder", customOrderSchema);
export default CustomOrder;
