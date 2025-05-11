exports.searchAll = async (req, res) => {
  try {
    const { 
      q = '',          // search query
      type = 'all',    // all|components|builds|users
      page = 1, 
      limit = 10,
      sort = 'relevance' // relevance|newest|popular
    } = req.query;

    const skip = (page - 1) * limit;
    const results = {};

    //COMPONENT SEARCH
    if (type === 'all' || type === 'components') {
      results.components = await Component.aggregate([
        { $match: { $text: { $search: q } } },
        { $sort: getSortStage(sort, 'components') },
        { $skip: skip },
        { $limit: limit },
        { $project: {
          _id: 1,
          name: 1,
          type: 1,
          image: 1,
          price: 1,
          score: { $meta: "textScore" }
        }}
      ]);
    }

    //BUILD SEARCH
    if (type === 'all' || type === 'builds') {
      results.builds = await Build.aggregate([
        { $match: { $text: { $search: q } } },
        { $sort: getSortStage(sort, 'builds') },
        { $skip: skip },
        { $limit: limit },
        { $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'creator'
        }},
        { $unwind: '$creator' },
        { $project: {
          _id: 1,
          title: 1,
          description: 1,
          images: 1,
          savesCount: 1,
          creator: {
            username: '$creator.username',
            avatar: '$creator.avatar'
          },
          score: { $meta: "textScore" }
        }}
      ]);
    }

    //USER SEARCH
    if (type === 'all' || type === 'users') {
      results.users = await User.aggregate([
        { $match: { $text: { $search: q } } },
        { $sort: getSortStage(sort, 'users') },
        { $skip: skip },
        { $limit: limit },
        { $project: {
          _id: 1,
          username: 1,
          avatar: 1,
          bio: 1,
          followerCount: 1,
          score: { $meta: "textScore" }
        }}
      ]);
    }


    if (type === 'all') {
      results.counts = {
        components: await Component.countDocuments({ $text: { $search: q } }),
        builds: await Build.countDocuments({ $text: { $search: q } }),
        users: await User.countDocuments({ $text: { $search: q } })
      };
    }

    res.json({
      success: true,
      query: q,
      type,
      page: parseInt(page),
      results
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: err.message
    });
  }
};


function getSortStage(sort, category) {
  const sorts = {
    components: {
      relevance: { score: { $meta: "textScore" } },
      newest: { createdAt: -1 },
      popular: { savesCount: -1 }
    },
    builds: {
      relevance: { score: { $meta: "textScore" } },
      newest: { createdAt: -1 },
      popular: { savesCount: -1 }
    },
    users: {
      relevance: { score: { $meta: "textScore" } },
      newest: { joinedAt: -1 },
      popular: { followerCount: -1 }
    }
  };
  return sorts[category][sort] || sorts[category].relevance;
}