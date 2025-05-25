const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    componentsMentioned: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Component'
    }],
    buildTypes: [String],
    preferencesDetected: [String]
  }
});

const summarySchema = new mongoose.Schema({
  lastBuildDiscussed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Build'
  },
  knownPreferences: {
    budgetRange: [Number],
    preferredBrands: [String],
    useCases: [String]
  }
});

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  sessionId: {
    type: String,
    required: true
  },
  messages: [messageSchema],
  summary: summarySchema,
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes
chatHistorySchema.index({ userId: 1, sessionId: 1 }, { unique: true });
chatHistorySchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 days TTL
chatHistorySchema.index({ 'messages.metadata.componentsMentioned': 1 });
chatHistorySchema.index({ 'messages.metadata.buildTypes': 1 });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

module.exports = ChatHistory; 