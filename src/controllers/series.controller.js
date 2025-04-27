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
        const { status, id } = req.params;
        // Convert `page` and `limit` to integers
        const pageNumber = parseInt(page);
        const pageLimit = parseInt(limit);

        // Ensure valid pagination values
        if (pageNumber <= 0 || pageLimit <= 0) {
            return res.status(400).json({ message: 'Invalid pagination parameters' });
        }

        // Build the query object for filtering
        const query = {
            langue: langue,
            status: status,
            parent_id: id
        };

        // If there's a search term, filter by title
        if (search) {
            query.title = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        // Query the Article collection with pagination, filtering by title if search is provided
        const series = await SeriesPart.find(query)
            .skip((pageNumber - 1) * pageLimit)  // Skip the records for the current page
            .limit(pageLimit);  // Limit the number of records per page

        // Get total count of Article documents that match the query
        const totalCount = await SeriesPart.countDocuments(query);

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

export const getAllSeriesList = async (req, res) => {
    try {
        const { langue, search, page = 1, limit = 5 } = req.query;
        const query = { type: "series", status: "published" };

        // Apply language filter if provided
        if (langue) {
            query.langue = langue;
        }

        // Apply search filter only if search is not empty
        if (search && search.trim() !== "") {
            query.title = { $regex: search, $options: "i" }; // Case-insensitive search
        }

        // Pagination setup
        const skip = (page - 1) * limit;
        const getAllSeriesPost = await Article.find(query)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination metadata
        const totalCount = await Article.countDocuments(query);
        return res.status(200).json({
            series: getAllSeriesPost,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page),
            totalResults: totalCount
        });

    } catch (error) {
        return res.status(500).json({ message: "An error occurred while fetching series", error });
    }
};
export const getSingleSeriesPart = async (req, res) => {
    try {
        // Get total count for pagination metadata
        const series = await SeriesPart.findById(req.params.id).populate("credits");
        
        return res.status(200).json(series);

    } catch (error) {
        return res.status(500).json({ message: "An error occurred while fetching series", error });
    }
};

export const createSeries = async (req, res) => {
    try {
     console.log("req.body I am called", req.body)
        const { parent_id} = req.body;
        
        // Validate required fields
        if (!parent_id ) {
            return res.status(400).json({ message: 'parent_id and part are required' });
        }
        const part=await SeriesPart.countDocuments({ parent_id: parent_id });  
        const obj={...req.body, part: part+1}
        const series = new SeriesPart(obj);
        await series.save();
        return res.status(201).json({ series });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Duplicate part number for this series' });
        }
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Updated updateSeries controller
export const updateSeries = async (req, res) => {
    const { id } = req.params;
    try {
        const series = await SeriesPart.findByIdAndUpdate(
            id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
        if (!series) {
            return res.status(404).json({ message: 'Series not found' });
        }
        return res.status(200).json({ series });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Duplicate part number for this series' });
        }
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getAllSeriesPart = async (req, res) => {
    try {
        const { status, parent_id } = req.params;
        const { limit = 10, page = 1 } = req.query;

        // Construct query object dynamically
        const query = {};
        if (status) query.status = status;
        if (parent_id) query.parent_id = parent_id;

        // Pagination setup
        const skip = (page - 1) * limit;

        // Fetch series parts with filtering and pagination
        const allPartOfSeries = await SeriesPart.find(query)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination metadata
        const totalCount = await SeriesPart.countDocuments(query);

        return res.status(200).json({
            parts: allPartOfSeries,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page),
            totalResults: totalCount
        });

    } catch (error) {
        return res.status(500).json({ message: "An error occurred while fetching series parts", error });
    }
};

