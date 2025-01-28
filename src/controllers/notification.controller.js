import { Notification } from "../model/notification.model.js";

export const createNotification = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        
        // Check if the fcmToken already exists in the database
        const findNotification = await Notification.findOne({ fcmToken });
        
        // If the notification already exists, respond with "OK"
        if (findNotification) {
            return res.status(201).json({ message: "OK" });
        }

        // Create a new notification if it doesn't exist
        const newNotification = new Notification(req.body);
        await newNotification.save();

        return res.status(201).json({ message: "OK" });
    } catch (error) {
        // Handle specific Mongoose errors (e.g., unique constraint violation)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Duplicate fcmToken, notification already exists' });
        }
        
        return res.status(500).json({ message: 'An error occurred while creating the notification', error });
    }
};
