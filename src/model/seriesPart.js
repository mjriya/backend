import mongoose from "mongoose";

const SeriesPartSchema = new mongoose.Schema({
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    },
    title:{
        type:String,
        default:""
    },
    type: { type: String, enum: ["bengali","hindi","english"] },
    slug: {
        type: String,
        unique: true
    },
    oldId: {
        type: String
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
    published_at_datetime: { type: Date, default: null },
    temp_published_at_datetime: { type: Date, default: null },
    updated_at_datetime: { type: Date },
    custom_published_at: { type: Date },
    banner_image: { type: String },
    banner_desc: { type: String },
    banner_caption: { type: String },
    img_alt: { type: String },
    hide_banner_image: { type: Boolean, default: false },
    seo_desc: { type: String },
    seo_title: { type: String },
    content: { type: String },
    status: { type: String, enum: ["draft", "published", "pending_approval", ""], default: "" },
    relatedPost:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SeriesPart'
    }],
    focusKeyphrase: { type: String },
   
},
    { timestamps: true }
);


const SeriesPart = mongoose.model('Series', SeriesPartSchema, 'series')

export {
    SeriesPart
};