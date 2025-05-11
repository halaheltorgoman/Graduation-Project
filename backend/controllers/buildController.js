const mongoose = require('mongoose');
const Build = require('../models/Build');
const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');
const buildService = require('../services/buildService');


exports.getNextComponents = async (req, res) => {
  try {
    const { selectedComponents, targetType } = req.body;
    
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
    if (!components || typeof components !== 'object') {
      return res.status(400).json({ message: 'Invalid components payload' });
    }

    const { valid, checks } = await buildService.checkCompatibility(components);

    res.json({
      valid,
      message: valid ? 'Build is compatible!' : 'Build has compatibility issues',
      checks
    });
  } catch (err) {
    res.status(500).json({
      message: 'Validation failed',
      error: err.message
    });
  }
};

exports.createBuild = async (req, res) => {
  try {
    const { components } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!components || typeof components !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid components data' });
    }

    const { valid, checks } = await buildService.checkCompatibility(components);
    if (!valid) {
      return res.status(400).json({ 
        success: false,
        message: 'Build is not compatible',
        checks 
      });
    }

    const newBuild = new Build({
      user: req.userId,  
      components: components,
      title: 'Unnamed Build',
      isShared: false
    });

    await newBuild.save();

   
    const populatedBuild = await Build.findById(newBuild._id)
      .populate('components.cpu')
      .populate('components.gpu')
      .populate('components.motherboard')
      .populate('components.memory')
      .populate('components.storage')
      .populate('components.psu')
      .populate('components.case')
      .populate('components.cooler');


    let totalPrice = 0;
    Object.values(populatedBuild.components.toObject()).forEach(component => {
      if (component && component.price) {
        totalPrice += component.price;
      }
    });

    populatedBuild.totalPrice = totalPrice;
    await populatedBuild.save();

    res.status(201).json({
      success: true,
      message: 'Build created successfully',
      build: populatedBuild,
      totalPrice: totalPrice,
      nextStep: `/createbuild/${newBuild._id}/finalize`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create build',
      error: err.message
    });
  }
};

exports.getBuildTotalPrice = async (req, res) => {
  try {
    const { buildId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const build = await Build.findById(buildId).populate([
      'components.cpu', 'components.gpu', 'components.motherboard',
      'components.memory', 'components.storage', 'components.psu',
      'components.case', 'components.cooler'
    ]);

    if (!build) {
      return res.status(404).json({ success: false, message: 'Build not found' });
    }

    if (!build.user.equals(req.userId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to access this build' 
      });
    }

 
    let totalPrice = 0;
    Object.values(build.components.toObject()).forEach(component => {
      if (component && component.price) {
        totalPrice += component.price;
      }
    });

  
    build.totalPrice = totalPrice;
    await build.save();

    res.json({
      success: true,
      totalPrice: totalPrice,
      build: build
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate total price',
      error: err.message
    });
  }
};

exports.finalizeBuild = async (req, res) => {
  try {
    const { buildId } = req.params;
    const { title, description, shareToCommunity } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const build = await Build.findById(buildId)
      .populate('components.cpu')
      .populate('components.gpu')
      .populate('components.motherboard')
      .populate('components.memory')
      .populate('components.storage')
      .populate('components.psu')
      .populate('components.case')
      .populate('components.cooler');

    if (!build) {
      return res.status(404).json({ success: false, message: 'Build not found' });
    }

    if (!build.user.equals(req.userId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to modify this build' 
      });
    }

    // Calculate total price
    let totalPrice = 0;
    Object.values(build.components.toObject()).forEach(component => {
      if (component && component.price) {
        totalPrice += component.price;
      }
    });

    // Update build details
    build.title = title || 'Unnamed Build';
    build.description = description || '';
    build.isShared = shareToCommunity === true;
    build.totalPrice = totalPrice;

    if (build.isShared) {
      const newPost = new CommunityPost({
        build: build._id,
        user: req.userId,
        title: build.title,
        description: build.description
      });
      await newPost.save();
    }

    await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { builds: buildId } }
    );

    await build.save();

    res.json({
      success: true,
      message: `Build ${build.isShared ? 'shared' : 'saved'} successfully`,
      build: build,
      totalPrice: totalPrice
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to finalize build',
      error: err.message
    });
  }
};