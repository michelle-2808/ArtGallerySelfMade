import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: { 
      type: String, 
      required: true, 
      unique: true 
    },
    items: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      imageUrl: { type: String }
    }],
    status: { 
      type: String, 
      required: true,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    shippingAddress: {
      name: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true }
    },
    trackingNumber: { type: String },
    shippingMethod: { type: String },
    paymentMethod: { type: String },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    notes: { type: String },
    statusHistory: [{
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String }
    }]
  },
  { timestamps: true }
);

// Pre-save hook to generate order number if not provided
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    // Generate order number based on timestamp and random string
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;

    // Add initial status to history
    if (!this.statusHistory || this.statusHistory.length === 0) {
      this.statusHistory = [{ status: this.status, timestamp: new Date() }];
    }
  }
  next();
});

// Method to update order status with history tracking
orderSchema.methods.updateStatus = function(status, note = '') {
  this.status = status;
  this.statusHistory.push({
    status: status,
    timestamp: new Date(),
    note: note
  });
  return this.save();
};

const Order = mongoose.model("Order", orderSchema);
export default Order;