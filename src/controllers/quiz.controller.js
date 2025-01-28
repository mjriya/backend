import { Quiz } from "../model/quiz.model.js";


export const getAllQuiz = async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const limitValue = Math.max(Number(limit), 1);
        const pageValue = Math.max(Number(page), 1);

        // Fetch the quizzes with pagination and sorting
        const allQuiz = await Quiz.find().select('-Content').sort({ Date: -1 })
            .sort({ Date: -1 })
            .skip((pageValue - 1) * limitValue)
            .limit(limitValue);

        // Get the total number of quizzes
        const totalQuiz = await Quiz.countDocuments();

        // Send the response with quizzes and pagination details
        res.status(200).json({
            allQuiz,
            pagination: {
                total: totalQuiz,
                limit: limitValue,
                page: pageValue,
                totalPages: Math.ceil(totalQuiz / limitValue),
            },
        });
    } catch (error) {
        // Handle any errors
        return res.status(500).json({ message: 'Something went wrong', error });
    }
};
export const QuizFindByType = async (req, res) => {
    const { Type } = req.params; // Extract Type from params
    const { limit = 10, page = 1 } = req.query;

    const limitValue = Math.max(Number(limit), 1); // Ensure limit is at least 1
    const pageValue = Math.max(Number(page), 1);   // Ensure page is at least 1

    try {
        // Fetch paginated quizzes
        const allQuiz = await Quiz.find({ Type }).select('-Content').sort({ Date: -1 })
            .skip((pageValue - 1) * limitValue) // Skip documents for pagination
            .limit(limitValue);                // Limit the number of results

        // Count total quizzes
        const totalQuiz = await Quiz.countDocuments({ Type });

        // Send the response with quizzes and pagination details
        res.status(200).json({
            allQuiz,
            pagination: {
                total: totalQuiz,
                limit: limitValue,
                page: pageValue,
                totalPages: Math.ceil(totalQuiz / limitValue),
            },
        });
    } catch (error) {
        // Handle any errors
        return res.status(500).json({ message: "Something went wrong", error });
    }
};

export const QuizFindBySlug = async (req, res) => {
    const { Type, slug } = req.params;
    try {
        const quiz = await Quiz.findOne({ Type, slug });

        const allQuiz = await Quiz.find({ Type }).select('-Content').sort({ Date: -1 }).limit(4)

        res.status(200).json({
            quiz,
            allQuiz
        });
    } catch (error) {
        // Handle any errors
        return res.status(500).json({ message: "Something went wrong", error });
    }
};
