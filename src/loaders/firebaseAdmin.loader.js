import admin from "firebase-admin";
<<<<<<< HEAD
import dotenv from "dotenv";

dotenv.config();

// Secure Firebase initialization
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

// Initialize Firebase only if all required credentials are present
if (Object.values(serviceAccount).every(value => value)) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  console.error('Incomplete Firebase credentials. Firebase admin not initialized.');
}

export { admin };
=======
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import fs from "fs";



// Resolve current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically load the JSON file
const serviceAccountPath = resolve(__dirname, "../../edureify-firebase-adminsdk-m3r6f-73c2ea5deb.json");
const serviceAccount = JSON.parse(await fs.promises.readFile(serviceAccountPath, "utf8"));

// console.log("serviceAccount: ", serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export { admin };

>>>>>>> 9052714860bebd02f034d6e7c78d570990ce8998
