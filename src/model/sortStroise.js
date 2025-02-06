import mongoose from "mongoose";

const StroiseSchema = new mongoose.Schema({
    post_id: { type: Number, unique: true },
    langue: { type: String, enum: ["bengali","hindi","english"] },
    title: { type: String, required: true },
    slug: {
        type: String,
        unique: true
    },
    oldId: {
        type: String
    },
    summary: { type: String },
    legacy_url: { type: String },
    primary_category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    series:{
        type:Boolean,
        default:false
    },
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
    status: { type: String, enum: ["draft", "published", "pending_approval", ""], default: "" },
    relatedPost:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stroise'
    }],
    focusKeyphrase: { type: String },
    web_story: [{
        type: { type: String, default: '' },
        cta_link: { type: String, default: '' },
        cta_text: { type: String, default: '' },
        title: { type: String, default: '' },
        img_src: { type: String, default: '' },
        desc: { type: String, default: '' }
    }]
},
    { timestamps: true }
);


const  Stroise = mongoose.model('Stroise', StroiseSchema, 'stroise')

export {
    Stroise
};