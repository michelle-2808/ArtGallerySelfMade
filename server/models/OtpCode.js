//models/OtpCode.js
import mongoose from "mongoose";

const otpCodeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: { type: String, required: true },
    purpose: { type: String, required: true }, // e.g., 'registration', 'password_reset'
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const OtpCode = mongoose.model("OtpCode", otpCodeSchema);
export default OtpCode;
