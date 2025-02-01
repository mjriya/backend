<<<<<<< HEAD
// import { admin } from "../loaders/firebaseAdmin.loader.js";
// import { Notification } from "../model/notification.model.js";

// const sendNotification = async (req, res) => {
//   try {
//     const { title, url, body, featureImage } = req.body;

//     if (!title || !body) {
//       return res.status(400).json({ message: "Title and body are required." });
//     }

//     console.log("Title, Body:", title, body);

//     const fcmTokens = await Notification.find(); // Assuming you store tokens in the Notification model

//     if (fcmTokens.length === 0) {
//       return res.status(404).json({ message: "No FCM tokens found." });
//     }

//     // Send notifications to all tokens
//     const responses = [];
//     for (const token of fcmTokens) {
//       const message = {
//         token: token.fcmToken, 
//         data: { title, featureImage, url, body }
//       };

//       try {
//         const response = await admin.messaging().send(message);
        
//         responses.push(response);
//       } catch (error) {
//         console.error("Error sending notification to token:", token, error);
//         responses.push({ token: token.fcmToken, error: error.message });
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Notifications sent successfully.",
//       responses,
//     });

//   } catch (error) {
//     console.error("Error sending notification:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to send notification.",
//       error: error.message,
//     });
//   }
// };


// export { sendNotification };
=======
import { admin } from "../loaders/firebaseAdmin.loader.js";
import { Notification } from "../model/notification.model.js";

const sendNotification = async (req, res) => {
  try {
    const { title, url, body, featureImage } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required." });
    }

    console.log("Title, Body:", title, body);

    const fcmTokens = await Notification.find(); // Assuming you store tokens in the Notification model

    if (fcmTokens.length === 0) {
      return res.status(404).json({ message: "No FCM tokens found." });
    }

    // Send notifications to all tokens
    const responses = [];
    for (const token of fcmTokens) {
      const message = {
        token: token.fcmToken, 
        data: { title, featureImage, url, body }
      };

      try {
        const response = await admin.messaging().send(message);
        
        responses.push(response);
      } catch (error) {
        console.error("Error sending notification to token:", token, error);
        responses.push({ token: token.fcmToken, error: error.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Notifications sent successfully.",
      responses,
    });

  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send notification.",
      error: error.message,
    });
  }
};


export { sendNotification };
>>>>>>> 9052714860bebd02f034d6e7c78d570990ce8998
