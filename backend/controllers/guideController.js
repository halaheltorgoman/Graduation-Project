const Build = require('../models/Build');
const User = require('../models/User');

exports.isGuideCreator = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'guidecreator') {
      return res.status(403).json({
        success: false,
        message: 'Only guide creators can perform this action'
      });
    }
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify guide creator status',
      error: err.message
    });
  }
};

exports.convertToGuide = async (req, res) => {
  try {
    const { buildId } = req.params;
    const { category } = req.body;

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

    build.isGuide = true;
    build.guideCategory = category;
    await build.save();

    res.json({
      success: true,
      message: 'Build converted to guide successfully',
      build
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to convert build to guide',
      error: err.message
    });
  }
};

exports.getGuidesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { 
      page = 1, 
      limit = 10,
      sortBy = 'newest', 
      minRating = 0,
      maxPrice
    } = req.query;
    const skip = (page - 1) * limit;

    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'rating':
        sort = { averageRating: -1 };
        break;
      case 'saves':
        sort = { savesCount: -1 };
        break;
      case 'price-asc':
        sort = { totalPrice: 1 };
        break;
      case 'price-desc':
        sort = { totalPrice: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }


    const filter = { 
      isGuide: true,
      guideCategory: category 
    };

    if (minRating > 0) {
      filter.averageRating = { $gte: parseFloat(minRating) };
    }

    const [guides, total] = await Promise.all([
      Build.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate({
  path: 'ratings.user',
  select: 'username avatar'
})
        .populate({
          path: 'components.cpu components.gpu components.motherboard components.memory components.storage components.psu components.case components.cooler',
          select: 'title image_source price'
        })
        .lean(),
      Build.countDocuments(filter)
    ]);

    let userId = null;
    if (req.userId) userId = req.userId.toString();

    const user = req.userId ? await User.findById(req.userId).select('savedGuides') : null;
    const savedGuideIds = user ? user.savedGuides.map(id => id.toString()) : [];

    const guidesWithDetails = guides.map(guide => {
      let totalPrice = 0;
      Object.values(guide.components).forEach(component => {
        if (component && component.price) {
          totalPrice += component.price;
        }
      });

      return {
        ...guide,
        totalPrice,
        isSaved: savedGuideIds.includes(guide._id.toString()),
        userRating: guide.ratings?.find(r => r.user?.toString() === userId)?.value || null
      };
    });

    res.json({
      success: true,
      guides: guidesWithDetails,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalGuides: total
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guides',
      error: err.message
    });
  }
};
exports.toggleSaveGuide = async (req, res) => {
  try {
    const { buildId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const build = await Build.findById(buildId);
    if (!build || !build.isGuide) {
      return res.status(404).json({ 
        success: false, 
        message: 'Guide not found' 
      });
    }

    const user = await User.findById(req.userId);
    const isSaved = user.savedGuides.includes(buildId);

    if (isSaved) {
     
      user.savedGuides.pull(buildId);
      build.savesCount = Math.max(0, (build.savesCount || 0) - 1);
    } else {
      user.savedGuides.addToSet(buildId);
      build.savesCount = (build.savesCount || 0) + 1;
    }

    await Promise.all([user.save(), build.save()]);

    res.json({
      success: true,
      message: `Guide ${isSaved ? 'unsaved' : 'saved'} successfully`,
      isSaved: !isSaved,
      savesCount: build.savesCount
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle save status',
      error: err.message
    });
  }
};


exports.rateGuide = async (req, res) => {
  try {
    const { buildId } = req.params;
    const { value } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (value < 1 || value > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    const build = await Build.findById(buildId);
    if (!build || !build.isGuide) {
      return res.status(404).json({ 
        success: false, 
        message: 'Guide not found' 
      });
    }

    const existingRating = build.ratings.find(r => 
      r.user.toString() === req.userId.toString()
    );

    if (existingRating) {
      existingRating.value = value;
    } else {
      build.ratings.push({
        user: req.userId,
        value
      });
    }

    const sum = build.ratings.reduce((acc, curr) => acc + curr.value, 0);
    build.averageRating = sum / build.ratings.length;

    await build.save();

    res.json({
      success: true,
      message: 'Guide rated successfully',
      averageRating: build.averageRating,
      userRating: value,
      totalRatings: build.ratings.length
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to rate guide',
      error: err.message
    });
  }
};

exports.getSavedGuides = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(req.userId)
      .select('savedGuides')
      .populate({
        path: 'savedGuides',
        match: { isGuide: true },
        options: {
          skip: parseInt(skip),
          limit: parseInt(limit),
          sort: { createdAt: -1 }
        },
        populate: [
          { path: 'user', select: 'username avatar' },
          {
            path: 'components.cpu components.gpu components.motherboard components.memory components.storage components.psu components.case components.cooler',
            select: 'title image_source price'
          }
        ]
      });

    const totalCount = await Build.countDocuments({
  _id: { $in: user.savedGuides },
  isGuide: true
});
    const guidesWithPrices = user.savedGuides.map(guide => {
      let totalPrice = 0;
      Object.values(guide.components.toObject()).forEach(component => {
        if (component && component.price) {
          totalPrice += component.price;
        }
      });
      return {
        ...guide.toObject(),
        totalPrice
      };
    });

    res.json({
      success: true,
      guides: guidesWithPrices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalGuides: totalCount
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved guides',
      error: err.message
    });
  }
};