import mongoose from "mongoose";

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
      attachments: [{ type: String }],
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
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    adminNotes: { type: String },
    approvedPrice: { type: Number },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate order number and initialize status history
customOrderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.orderNumber = `CUST-${timestamp}-${random}`;

    // Add initial status to history
    if (!this.statusHistory || this.statusHistory.length === 0) {
      this.statusHistory = [{ status: this.status, timestamp: new Date() }];
    }
  }
  next();
});

// Method to update order status with history tracking
customOrderSchema.methods.updateStatus = function (status, note = "") {
  this.status = status;
  this.statusHistory.push({
    status: status,
    timestamp: new Date(),
    note: note,
  });
  return this.save();
};

const CustomOrder = mongoose.model("CustomOrder", customOrderSchema);
export default CustomOrder;
