const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communityPostSchema = new Schema({
  build: { 
    type: Schema.Types.ObjectId, 
    ref: 'Build', 
    required: true 
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  ratings: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    value: { type: Number, min: 1, max: 5 }
  }],
  comments: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  savesCount: { type: Number, default: 0 },

});

module.exports = mongoose.model('CommunityPost', communityPostSchema);