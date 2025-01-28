import fs from 'fs';
import path from 'path';
import { Article } from "../model/articel.model.js";

export const generateNewsSitemap = async () => {
    const articles = await Article.find({
        published_at_datetime: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
    });

    const sitemapEntries = articles.map(article => `
      <url>
        <loc>${process.env.BASE_URL}/articles/${article.slug}</loc>
        <news:news>
          <news:publication>
            <news:name>Your Site Name</news:name>
            <news:language>en</news:language>
          </news:publication>
          <news:publication_date>${article.published_at_datetime.toISOString()}</news:publication_date>
          <news:title>${article.title}</news:title>
        </news:news>
      </url>
    `).join('');

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
      ${sitemapEntries}
    </urlset>`;

    fs.writeFileSync(path.resolve('./public/news-sitemap.xml'), sitemapContent);
};
