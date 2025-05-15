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
  images: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  guideCategory: {
    type: String,
    enum: ['gaming', 'workstation', 'budget', 'other'],
    default: null
  },
  isGuide: {
    type: Boolean,
    default: false
  },
  ratings: [{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  value: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
}],
});
buildSchema.index({
  title: 'text',
  description: 'text',
});
buildSchema.index({ isGuide: 1, guideCategory: 1 });
buildSchema.index({ isGuide: 1, savesCount: -1 });
buildSchema.index({ isGuide: 1, averageRating: -1 });

module.exports = mongoose.model('Build', buildSchema);