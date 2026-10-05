const mongoose = require('mongoose');

const StudySessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  subjectName: { type: String, default: 'General Study' },
  durationMinutes: { type: Number, required: true },
  notes: { type: String, default: '' },
  confidenceRating: { type: Number, min: 1, max: 5, default: 4 },
  sessionType: { type: String, enum: ['focus_session', 'stopwatch', 'manual'], default: 'focus_session' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudySession', StudySessionSchema);
