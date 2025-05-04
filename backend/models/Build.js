const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const buildSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  components: {
    cpu: { type: Schema.Types.ObjectId, ref: 'CPU' },
    gpu: { type: Schema.Types.ObjectId, ref: 'GPU' },
    motherboard: { type: Schema.Types.ObjectId, ref: 'Motherboard' },
    memory: { type: Schema.Types.ObjectId, ref: 'Memory' },
    storage: { type: Schema.Types.ObjectId, ref: 'Storage' },
    psu: { type: Schema.Types.ObjectId, ref: 'PSU' },
    case: { type: Schema.Types.ObjectId, ref: 'Case' },
    cooler: { type: Schema.Types.ObjectId, ref: 'Cooler' },
  },
  title: {
    type: String,
    default: 'Unnamed Build'
  },
  description: String,
  isShared: {
    type: Boolean,
    default: false
  },
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
  savesCount: { type: Number, default: 0 }

});

module.exports = mongoose.model('Build', buildSchema);