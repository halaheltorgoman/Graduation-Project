const mongoose = require('mongoose');
const Build = require('../models/Build');
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

    res.status(201).json({
      success: true,
      message: 'Build created successfully',
      build: newBuild,
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

exports.finalizeBuild = async (req, res) => {
  try {
    const { buildId } = req.params;
    const { title, description, shareToCommunity } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const build = await Build.findById(buildId);
    if (!build) {
      return res.status(404).json({ success: false, message: 'Build not found' });
    }

    if (!build.user.equals(req.userId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to modify this build' 
      });
    }


    build.title = title || 'Unnamed Build';
    build.description = description || '';
    build.isShared = shareToCommunity === true;

    await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { builds: buildId } }, 
    );

    await build.save();

    const populatedBuild = await Build.findById(build._id)
      .populate('components.cpu')
      .populate('components.gpu')
      .populate('components.motherboard')
      .populate('components.memory')
      .populate('components.storage')
      .populate('components.psu')
      .populate('components.case')
      .populate('components.cooler');

    res.json({
      success: true,
      message: `Build ${build.isShared ? 'shared' : 'saved'} successfully`,
      build: populatedBuild
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to finalize build',
      error: err.message
    });
  }
};
