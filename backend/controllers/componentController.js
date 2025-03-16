
const User = require('../models/User');
const CPU = require('../models/Components/CPU');
const GPU = require('../models/Components/GPU');
const Motherboard = require('../models/Components/MotherBoard');
const Case = require('../models/Components/Case');
const Memory = require('../models/Components/Memory');
//const Storage = require('../models/Components/Storage');
//const PSU = require('../models/Components/PSU');
//const Cooler = require('../models/Components/Cooler');


const componentModels = {
  cpu: CPU,
  gpu: GPU,
  motherboard: Motherboard,
  memory: Memory,
  case:Case,
  //storage: Storage,
  //psu: PSU,
  //cooler: Cooler,

};
function getComponentModel(type) {
  const model = componentModels[type.toLowerCase()];
  if (!model) throw new Error('Invalid component type');
  return model;
}

exports.getComponentsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { minRating, maxRating, minPrice, maxPrice, sortBy } = req.query;
    
    //validation
    if (minPrice && isNaN(minPrice)) {
      return res.status(400).json({ message: "Invalid minPrice" });
    }

    if (maxPrice && isNaN(maxPrice)) {
      return res.status(400).json({ message: "Invalid maxPrice" });
    }

    if (minRating && isNaN(minRating)) return res.status(400).json({ message: "Invalid minRating" });
    if (maxRating && isNaN(maxRating)) return res.status(400).json({ message: "Invalid maxRating" });

    //build
    const Model = getComponentModel(type.toLowerCase());
    const filter = {};
   
    if (minPrice || maxPrice) {
      filter.price = {};
    
      if (minPrice) {
        filter.price.$gte = parseFloat(minPrice);
      }
    
      if (maxPrice) {
        filter.price.$lte = parseFloat(maxPrice);
      }
    }

    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) filter.rating.$gte = parseFloat(minRating);
      if (maxRating) filter.rating.$lte = parseFloat(maxRating);
    }

    //sort
    const sort = {};
    if (sortBy) {
      const [field, order] = sortBy.split(':');
      sort[field] = order === 'desc' ? -1 : 1;
    }

    const components = await Model.find(filter)
      .sort(sort)
      .limit(50);

    res.json(components);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.addToFavorites = async (req, res) => {
  try {
    const { componentId, componentType } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const Model = getComponentModel(componentType.toLowerCase());
    const component = await Model.findById(componentId);

    if (!component) return res.status(404).json({ message: 'Component not found' });

    // Check if already favorited
    if (user.favorites.some(fav => fav.componentId.equals(componentId) && fav.componentType.toLowerCase())) {
      return res.status(400).json({ message: 'Component already in favorites' });
    }

    user.favorites.push({
      componentType: componentType.toLowerCase(),
      componentId
    });

    await user.save();
    res.json({ message: 'Added to favorites', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
exports.removeFavorite = async (req, res) => {
  try {
    const { componentId, componentType } = req.body;
    
    const user = await User.findById(req.userId);
    
    user.favorites = user.favorites.filter(fav =>
      !(fav.componentType === componentType && 
        fav.componentId.equals(componentId) ));
    
    await user.save();
    res.json({ message: 'Removed from favorites', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.searchComponents = async (req, res) => {
  try {
    const { type } = req.params;
    const { minRating, maxRating, search, minPrice, maxPrice, sortBy } = req.query;

    
    const Model = getComponentModel(type.toLowerCase()); 
    
    let query = Model.find();

    
    if (search) {
      query = query.find({ $text: { $search: search, $caseSensitive:false } });
    }

   
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      query = query.where('price', priceFilter);
    }
    if (minRating || maxRating) {
      const ratingFilter = {};
      if (minRating) ratingFilter.$gte = parseFloat(minRating);
      if (maxRating) ratingFilter.$lte = parseFloat(maxRating);
      query = query.where('rating', ratingFilter);
    }

    
    if (sortBy) {
      const [field, order] = sortBy.split(':');
      query = query.sort({ 
        [field]: order === 'desc' ? -1 : 1 
      });
    }
    const results = await query.limit(100).exec();
    res.json(results);

  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
  }
};