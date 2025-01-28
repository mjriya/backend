import express from "express"
import cors from "cors"
import compression from "compression"
import Joi from "joi"
import { initRoutes } from "./routes/index.js"
import { environment } from "./loaders/environment.loader.js"
import { db } from "./loaders/db.loader.js"

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

// Async function to start the server
const startServer = async () => {
    try {
        // Connect to the database first
        await db()
        
        // Initialize routes
        initRoutes(app)

        const PORT = environment.PORT || 3000
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    } catch (error) {
        console.error("Failed to start server:", error)
        process.exit(1)
    }
}

// Error handling middleware
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

// Start the server
startServer()

export {
    app,
    express
}
