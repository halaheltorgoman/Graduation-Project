const Build = require("../models/Build");
const User = require("../models/User");

const componentModels = {
    CPU: require('../models/Components/CPU'),
    GPU: require('../models/Components/GPU'),
    Motherboard: require('../models/Components/MotherBoard'),
    RAM: require('../models/Components/Memory'),
    Case: require('../models/Components/Case'),
    Storage: require('../models/Components/Storage'),
    Cooler: require('../models/Components/Cooler'),
};

// Helper function to get model
function getComponentModel(type) {
    const model = componentModels[type];
    if (!model) throw new Error(`Invalid component type: ${type}`);
    return model;
}

// Create a new build
exports.createBuild = async (req, res) => {
    try {
        const { title, description, components } = req.body;

        // Validate components
        const validComponents = (await Promise.all(
            components.map(async (comp) => {
                const Model = getComponentModel(comp.type);
                return await Model.findById(comp.componentId) ? comp : null;
            })
        )).filter(Boolean); // Removes null values

        if (validComponents.length !== components.length) {
            return res.status(400).json({ message: "One or more components are invalid" });
        }

        const build = new Build({
            user: req.userId,
            title,
            description,
            components: validComponents,
        });

        await build.save();
        res.status(201).json(build);
    } catch (err) {
        res.status(500).json({ message: "Build creation failed", error: err.message });
    }
};
