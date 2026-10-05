const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  code: { type: String, default: '' },
  color: { type: String, default: '#6366f1' },
  targetHours: { type: Number, default: 20 },
  completedHours: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  topics: [{
    id: { type: String },
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false }
  }],
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subject', SubjectSchema);
