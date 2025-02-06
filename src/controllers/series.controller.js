import mongoose from 'mongoose';
import { SeriesPart } from '../model/seriesPart.js';
import { Article } from '../model/articel.model.js';

export const getAllSeries = async (req, res) => {
    try {
        const { parentId } = req.params;
        
        // Convert parentId to ObjectId
        const parentObjectId = mongoose.Types.ObjectId(parentId);

        // Extract pagination parameters (default to page 1 and limit 10)
        const { page = 1, limit = 10 } = req.query;
        
        // Convert `page` and `limit` to integers
        const pageNumber = parseInt(page);
        const pageLimit = parseInt(limit);

        // Ensure valid pagination values
        if (pageNumber <= 0 || pageLimit <= 0) {
            return res.status(400).json({ message: 'Invalid pagination parameters' });
        }

        // Query the SeriesPart collection with pagination and parent_id reference
        const series = await SeriesPart.find({ parent_id: parentObjectId })
            .skip((pageNumber - 1) * pageLimit)  // Skip the records for the current page
            .limit(pageLimit);  // Limit the number of records per page

        // Get total count of SeriesPart to calculate total pages
        const totalCount = await SeriesPart.countDocuments({ parent_id: parentObjectId });

        return res.status(200).json({
            series,
            totalCount,
            totalPages: Math.ceil(totalCount / pageLimit),
            currentPage: pageNumber
        });
    } catch (error) {
       
        
        // Handle other errors
        return res.status(500).json({ message: 'An error occurred while fetching series', error });
    }
};


export const getAllSeriesArticle = async (req, res) => {
    try {
        const { page = 1, limit = 10, langue, search } = req.query;

        // Convert `page` and `limit` to integers
        const pageNumber = parseInt(page);
        const pageLimit = parseInt(limit);

        // Ensure valid pagination values
        if (pageNumber <= 0 || pageLimit <= 0) {
            return res.status(400).json({ message: 'Invalid pagination parameters' });
        }

        // Build the query object for filtering
        const query = {
            type: "series",
            langue: langue,
        };

        // If there's a search term, filter by title
        if (search) {
            query.title = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        // Query the Article collection with pagination, filtering by title if search is provided
        const series = await Article.find(query)
            .skip((pageNumber - 1) * pageLimit)  // Skip the records for the current page
            .limit(pageLimit);  // Limit the number of records per page

        // Get total count of Article documents that match the query
        const totalCount = await Article.countDocuments(query);

        return res.status(200).json({
            series,
            totalCount,
            totalPages: Math.ceil(totalCount / pageLimit),
            currentPage: pageNumber
        });
    } catch (error) {
        // Handle other errors
        return res.status(500).json({ message: 'An error occurred while fetching series', error });
    }
};



export const createSeries = async (req, res) => {
    try {
       

        // Query the SeriesPart collection with pagination and parent_id reference
        const series = new SeriesPart(req.body)
        await series.save()
        

        return res.status(200).json({series});
    } catch (error) {
       
        return res.status(500).json({ message: 'An error occurred while fetching series', error });
    }
};
