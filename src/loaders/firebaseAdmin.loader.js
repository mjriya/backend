// import admin from "firebase-admin";
// import { fileURLToPath } from "url";
// import { dirname, resolve } from "path";
// import fs from "fs";



// // Resolve current directory
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Dynamically load the JSON file
// const serviceAccountPath = resolve(__dirname, "../../edureify-firebase-adminsdk-m3r6f-73c2ea5deb.json");
// const serviceAccount = JSON.parse(await fs.promises.readFile(serviceAccountPath, "utf8"));

// // console.log("serviceAccount: ", serviceAccount);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// export { admin };

