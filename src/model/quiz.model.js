import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema({
    id: Number,
    Title: String,
    Content: String,
    Excerpt: String,
    Date: String,
    "Post Type": String,
    Type: String,
    slug: String,
    Permalink: String
},
    { timestamps: true }
);

const Quiz = mongoose.model('Quiz', QuizSchema, 'quizs')

export { Quiz };