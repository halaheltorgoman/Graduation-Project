exports.createBuild = async (req, res) => {
    const { name, description, components, isShared } = req.body;
  
    try {
      // 1. Check component compatibility (use your existing logic)
      const isCompatible = await buildService.checkCompatibility(components);
      if (!isCompatible) {
        return res.status(400).json({ message: "Components are incompatible" });
      }
  
      // 2. Create the build
      const build = new Build({
        userId: req.userId,
        name,
        description,
        components,
        isShared: isShared || false, 
      });
  
      await build.save();
  
      // 3. Add the build to the user's saved builds
      const user = await User.findById(req.userId);
      user.savedBuilds.push(build._id);
      await user.save();
  
      res.status(201).json({ 
        message: "Build saved successfully", 
        build,
        isShared: build.isShared // Return sharing status
      });
  
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };

  exports.shareBuild = async (req, res) => {
    const { id: buildId } = req.params;
    const { isShared } = req.body; // true/false
  
    try {
      const build = await Build.findById(buildId);
      if (!build) {
        return res.status(404).json({ message: "Build not found" });
      }
  
      // Update sharing status
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