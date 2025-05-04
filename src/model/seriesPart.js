import mongoose from "mongoose";

const SeriesPartSchema = new mongoose.Schema({
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true  // Added validation since your controller requires it
    },
    title: {
        type: String,
        default: ""
    },
    slug: {
        type: String,
        unique: true,

    },
    part: {
        type: Number,
        required: true  // Remove default since we're calculating it
    },
    summary: { type: String },
    credits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    seo_desc: { type: String },
    seo_title: { type: String },
    content: { type: String },
    status: {
        type: String,
        enum: ["draft", "published", "pending_approval"], // Removed empty string
        default: "draft"
    },
    relatedPost: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SeriesPart'
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    focusKeyphrase: { type: String },
}, { timestamps: true });

// CORRECTED index declaration (fixed variable name)
SeriesPartSchema.index({ parent_id: 1, part: 1 }, { unique: true });

// Remove the duplicate index declaration that was using the wrong variable name
const SeriesPart = mongoose.model('SeriesPart', SeriesPartSchema, 'seriesPart');

export { SeriesPart };