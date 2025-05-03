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
  }
});

module.exports = mongoose.model('Build', buildSchema);