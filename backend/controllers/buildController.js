const Build = require("../models/Build");
const buildService = require("../services/buildService");


exports.getComponents = async (req, res) => {
  try {
    const components = await buildService.getCompatibleComponents(
      req.body.selectedComponents,
      req.params.type
    );
    res.json(components);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.checkCompatibility = async (req, res) => {
  try {
    const compatibility = await buildService.checkCompatibility(req.body.components);
    res.json(compatibility);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.createBuild = async (req, res) => {
    const { name, description, components, isShared } = req.body;
  
    try {
      const isCompatible = await buildService.checkCompatibility(components);
      if (!isCompatible) {
        return res.status(400).json({ message: "Components are incompatible" });
      }
  
      const build = new Build({
        userId: req.userId,
        name,
        description,
        components,
        isShared: isShared || false, 
      });
   
      await build.save();
  
      const user = await User.findById(req.userId);
      user.savedBuilds.push(build._id);
      await user.save();
  
      res.status(201).json({ 
        message: "Build saved successfully", 
        build,
        isShared: build.isShared 
      });
  
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };

  exports.shareBuild = async (req, res) => {
    const { id: buildId } = req.params;
    const { isShared } = req.body; 
  
    try {
      const build = await Build.findById(buildId);
      if (!build) {
        return res.status(404).json({ message: "Build not found" });
      }
  
      build.isShared = isShared;
      await build.save();
  
      res.json({ 
        message: `Build ${isShared ? "shared" : "unshared"} successfully`, 
        build 
      });
  
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };