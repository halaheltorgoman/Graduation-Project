const Build = require('../models/Build');
const buildService = require('../services/buildService');

exports.getNextComponents = async (req, res) => {
  try {
    const { selectedComponents, targetType } = req.body;
    
    // Validate input
    if (!targetType || typeof selectedComponents !== 'object') {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }

    const compatibleComponents = await buildService.getCompatibleComponents(
      selectedComponents, 
      targetType
    );

    res.json({
      type: targetType,
      components: compatibleComponents
    });
  } catch (err) {
    res.status(500).json({ 
      message: err.message || 'Failed to get compatible components',
      error: err.message 
    });
  }
};



exports.validateBuild = async (req, res) => {
  try {
    const { components } = req.body;
    
    // Validate all components exist
    const componentPromises = Object.entries(components).map(async ([type, id]) => {
      const Model = buildService.getComponentModel(type);
      return Model.findById(id);
    });

    const componentObjects = await Promise.all(componentPromises);
    const componentMap = componentObjects.reduce((acc, comp, index) => {
      const type = Object.keys(components)[index];
      acc[type.toLowerCase()] = comp;
      return acc;
    }, {});

    // Check full compatibility
    const isValid = await buildService.checkCompatibility(componentMap);
    
    res.json({
      valid: isValid,
      message: isValid ? 'Build is compatible!' : 'Build has compatibility issues'
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Validation failed', 
      error: err.message 
    });
  }
};

exports.saveBuild = async (req, res) => {
  try {
    const { components, title, description } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate components structure
    if (!components || typeof components !== 'object') {
      return res.status(400).json({ message: 'Invalid components data' });
    }

    // Validate each component exists in its respective collection
    const componentValidation = {};
    const validationPromises = Object.entries(components).map(async ([type, id]) => {
      const Model = buildService.getComponentModel(type);
      if (!Model) {
        throw new Error(`Invalid component type: ${type}`);
      }
      const component = await Model.findById(id);
      componentValidation[type] = component;
      return component;
    });

    await Promise.all(validationPromises);
    
    // Check if all components were found
    const missingComponents = Object.entries(componentValidation)
      .filter(([_, comp]) => !comp)
      .map(([type, _]) => type);

    if (missingComponents.length > 0) {
      return res.status(400).json({ 
        message: 'Invalid component IDs',
        missing: missingComponents
      });
    }

    // Verify compatibility using the service
    const isValid = await buildService.checkCompatibility(components);
    if (!isValid) {
      return res.status(400).json({ message: 'Build is not compatible' });
    }

    // Create the build document
    const newBuild = new Build({
      user: req.user._id,
      components: components,
      title: title || 'Unnamed Build',
      description: description || ''
    });

    await newBuild.save();

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { builds: newBuild._id } },
      { new: true }
    );
    // Populate components for the response
    const populatedBuild = await Build.findById(newBuild._id)
      .populate('components.cpu')
      .populate('components.gpu')
      .populate('components.motherboard')
      .populate('components.ram')
      .populate('components.storage')
      .populate('components.psu')
      .populate('components.case')
      .populate('components.cooler');

    res.status(201).json({
      message: 'Build saved successfully',
      build: populatedBuild
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to save build',
      error: err.message
    });
  }
};

/*
exports.shareBuild = async (req, res) => {
  try {
    const { buildId } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const build = await Build.findById(buildId);
    if (!build) {
      return res.status(404).json({ message: 'Build not found' });
    }

    if (build.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to share this build' });
    }

    build.isPublic = true;
    await build.save();

    const populatedBuild = await Build.findById(buildId)
      .populate('components.cpu')
      .populate('components.gpu')
      .populate('components.motherboard')
      .populate('components.ram')
      .populate('components.storage')
      .populate('components.psu')
      .populate('components.case')
      .populate('components.cooler');

    res.json({
      message: 'Build shared to community successfully',
      build: populatedBuild
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to share build',
      error: err.message
    });
  } 
};*/