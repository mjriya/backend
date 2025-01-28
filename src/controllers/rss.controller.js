import { Article } from "../model/articel.model.js";
import { Category } from "../model/category.model.js";

const getRssFeedController = async (req, res) => {
  try {
    // Extract type query parameter
    const { categories } = req.query;

    // Build the query object
    let query = {
      published_at_datetime: { $ne: null },
    };
    if (categories) {
      const category = await Category.findOne({ slug: categories });
      if (category) {
        query.primary_category = category._id;
      }
    }

    // Fetch articles based on the query
    const articles = await Article.find(query)
      .sort({ published_at_datetime: -1 })
      .limit(18);

    const webLink = process.env.WEB_LINK || "https://sportzpoint.com/";

    // Generate RSS items
    const rssItems = articles
      .map((article) => {
        const imgUrl = article.banner_image ? escape(article.banner_image) : "";
        const imageUrl = "https://dmpsza32x691.cloudfront.net/" + imgUrl;
        return `
      <item>
        <title>${(article.title)}</title>
        <link>${webLink}/articles/${escape(article.slug)}</link>
        <description>${(article.summary || "")}</description>
        <pubDate>${new Date(article.published_at_datetime).toUTCString()}</pubDate>
        <category>${escape(article.primary_category?.name || "General")}</category>
        <guid isPermaLink="true">${webLink}/articles/${escape(article.slug)}</guid>
        ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg" />` : ""}
        ${imageUrl ? `<media:content url="${imageUrl}" type="image/jpeg" medium="image" />` : ""}
      </item>
      `;
      })
      .join("");

    // Generate the RSS feed
    const rssFeed = `
      <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
        <channel>
          <title>SportPoint News</title>
          <link>${webLink}</link>
          <description>Latest articles from SportPoint</description>
          <atom:link href="${webLink}/rss/rss-feed" rel="self" type="application/rss+xml" />
          ${rssItems}
        </channel>
      </rss>
    `;

    res.set("Content-Type", "application/xml");
    res.status(200).send(rssFeed.trim());
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    res.status(500).send("Internal Server Error");
  }
};

export  { getRssFeedController }