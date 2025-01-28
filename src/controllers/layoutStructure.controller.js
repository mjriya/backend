import { Customize } from "../model/customize.model.js";

export const getLayoutStructure = async (req, res) => {
    try {
        
        
        const layoutStructure = await Customize.findOne();

        if (!layoutStructure) {
            return res.status(404).json({ message: 'No layout structure found' });
        }
        return res.status(200).json(layoutStructure);
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred', error });
    }
};
