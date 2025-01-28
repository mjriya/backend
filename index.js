// import { app } from "./src/index.js";
// import { environment } from "./src/loaders/environment.loader.js";
// import { WebSocketServer } from "ws";

// // Declare wss variable
// let wss;

// // WebSocket broadcast helper
// const broadcast = (data) => {
//   if (wss) {
//     wss.clients.forEach((client) => {
//       if (client.readyState === 1) {
//         client.send(JSON.stringify(data));
//       }
//     });
//   }
// };

// // Initialize the HTTP Server
// (async function init() {
//   const server = app.listen(environment.PORT, () => {
//     console.log(`Server listening on port ${environment.PORT}`);
//   });

//   // Initialize WebSocket Server
//   wss = new WebSocketServer({ server });

//   // WebSocket connection setup
//   wss.on("connection", (ws) => {
//     console.log("New WebSocket connection established");

//     ws.on("message", (message) => {
//       console.log(`Received message: ${message}`);
//     });

//     // Ensure client cleanup upon disconnection
//     ws.on("close", () => {
//       console.log("WebSocket connection closed");
//       // Remove the client from active clients
//       wss.clients.delete(ws);
//     });
//   });

//   // Set broadcast function for usage in controllers
//   app.set("broadcast", broadcast);
// })();

// export { broadcast }; 
