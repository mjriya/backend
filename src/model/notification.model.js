import { mongoose } from "../loaders/db.loader.js";

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String },
  fcmToken: {
    type: String,
    unique: true
  }
}, { timestamps: true })

const Notification = mongoose.model("Notification", NotificationSchema, "notifications");

export { Notification };
