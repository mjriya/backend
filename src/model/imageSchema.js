import mongoose from "mongoose";
import { db } from "../loaders/db.loader.js";

const ArticleSchema = new mongoose.Schema({
    post_id: { type: Number, unique: true },
    type: { type: String, enum: ["Article", "Video", "Newsletter", "CustomPage", "Gallery", "Web Story"] },
    title: { type: String },
    slug: {
        type: String,

    },
    oldId: {
        type: String
    },
    summary: { type: String },
    legacy_url: { type: String },
    primary_category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
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
    updated_at_datetime: { type: Date },
    custom_published_at: { type: Date },
    banner_image: { type: String },
    video: { type: String },
    video_caption: { type: String },
    banner_desc: { type: String },
    banner_caption: { type: String },
    img_alt: { type: String },
    hide_banner_image: { type: Boolean, default: false },
    seo_desc: { type: String },
    seo_title: { type: String },
    content: { type: String },
    status: { type: String, enum: ["draft", "published", "pending_approval", ""], default: "" },
    isLive: { type: Boolean, default: false },
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

ArticleSchema.pre('save', async function (next) {
    if (!this.isModified('slug')) return next();

    try {

        const existingArticle = await this.constructor.findOne({ slug: this.slug });
        if (existingArticle) {

            if (existingArticle && existingArticle.status !== 'draft') next();
            else
                if (existingArticle && existingArticle.post_id !== this.post_id) {
                    throw new Error('Slug already exists for another article.');
                }
           
        } else next();
    } catch (err) {
        next(err);
    }
});

const Article = mongoose.model('Article', ArticleSchema, 'articles')

export {
    Article
};