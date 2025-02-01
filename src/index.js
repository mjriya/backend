import express from "express"
import cors from "cors"
import compression from "compression"
import Joi from "joi"
import { initRoutes } from "./routes/index.js"
import { environment } from "./loaders/environment.loader.js"
import { db } from "./loaders/db.loader.js"

const port = environment.PORT  
const { ValidationError } = Joi;
const app = express()
app.use(cors())
app.use(compression())
app.use(express.json())
app.use(
    express.urlencoded({
        extended: true
    })
)

// Initialize database connection
let isDbConnected = false;

// Explicitly connect to database for local development
const connectDatabase = async () => {
    if (!isDbConnected) {
        try {
            await db();
            isDbConnected = true;
        } catch (error) {
            console.error("Database connection failed:", error);
            process.exit(1);
        }
    }
}

app.use((err, req, res, next) => {
    console.log(err)
    if (environment.SHOW_ADMIN) {
        console.log(err)
    }
    if (err) {
        if (err.statusCode === 500) {
            // sentry.captureException(err)
        }
        res.status(err instanceof ValidationError ? 400 : err.statusCode || 500).send({
            statusCode: err instanceof ValidationError ? 400 : err.statusCode || 500,
            message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong. Please contact the administrator'
        })
    } else {
        
        next()
    }
})

// Initialize routes
initRoutes(app)

// Call database connection before starting the server
connectDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});

// Vercel serverless function handler
const handler = async (req, res) => {
    // Ensure database connection
    if (!isDbConnected) {
        try {
            await db();
            isDbConnected = true;
        } catch (error) {
            console.error("Database connection failed:", error);
            return res.status(500).json({ error: "Database connection failed" });
        }
    }

    // Handle the request
    app(req, res);
}
export default handler;
