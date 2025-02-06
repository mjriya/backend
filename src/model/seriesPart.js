import mongoose from "mongoose";

const SeriesPartSchema = new mongoose.Schema({
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    },
    title: {
        type: String,
        default: ""
    },
    type: { type: String, enum: ["bengali", "hindi", "english"] },
    slug: {
        type: String,
        unique: true
    },

    summary: { type: String },

    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    credits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    seo_desc: { type: String },
    seo_title: { type: String },
    content: { type: String },
    status: { type: String, enum: ["draft", "published", "pending_approval", ""], default: "" },
    relatedPost: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SeriesPart'
    }],
    focusKeyphrase: { type: String },

},
    { timestamps: true }
);


const SeriesPart = mongoose.model('SeriesPart', SeriesPartSchema, 'seriesPart')

export {
    SeriesPart
};