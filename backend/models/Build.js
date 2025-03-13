
const mongoose = require('mongoose');
const Case = require('../models/Components/Case');
const buildSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  components: {
    cpu: { type: mongoose.Schema.Types.ObjectId, ref: 'CPU' },
    gpu: { type: mongoose.Schema.Types.ObjectId, ref: 'GPU' },
    motherboard: { type: mongoose.Schema.Types.ObjectId, ref: 'Motherboard' },
    memory: { type: mongoose.Schema.Types.ObjectId, ref: 'Memory' },
    storage: { type: mongoose.Schema.Types.ObjectId, ref: 'Storage' },
    psu: { type: mongoose.Schema.Types.ObjectId, ref: 'PSU' },
    pcCase: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
    cooler: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooler' },
    fans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fan' }]
  },
  isShared: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  totalWattage: Number,
  compatibilityIssues: [String]
});

module.exports = mongoose.model('Build', buildSchema);