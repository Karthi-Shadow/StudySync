const Subject = require('../models/Subject');
const { getDBState, inMemoryStore } = require('../config/db');

// Get all subjects for logged-in user
exports.getSubjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isConnectedToMongo } = getDBState();

    if (isConnectedToMongo) {
      const subjects = await Subject.find({ user: userId }).sort({ createdAt: -1 });
      return res.json({ subjects });
    } else {
      const userSubjects = inMemoryStore.subjects.filter(s => s.user === userId);
      return res.json({ subjects: userSubjects });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects', error: error.message });
  }
};

// Create a new subject/course
exports.createSubject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, code, color, targetHours, deadline, difficulty, topics, notes } = req.body;

    if (!name || !deadline) {
      return res.status(400).json({ message: 'Subject name and target deadline are required' });
    }

    const { isConnectedToMongo } = getDBState();

    const formattedTopics = (topics || []).map((t, idx) => ({
      id: 'top_' + Date.now() + '_' + idx,
      title: typeof t === 'string' ? t : t.title,
      isCompleted: typeof t === 'object' ? !!t.isCompleted : false
    }));

    if (isConnectedToMongo) {
      const newSubject = await Subject.create({
        user: userId,
        name,
        code: code || '',
        color: color || '#6366f1',
        targetHours: targetHours ? Number(targetHours) : 20,
        completedHours: 0,
        deadline: new Date(deadline),
        difficulty: difficulty || 'Medium',
        topics: formattedTopics,
        notes: notes || ''
      });
      return res.status(201).json({ message: 'Subject created successfully', subject: newSubject });
    } else {
      const mockId = 'sbj_' + Date.now();
      const newSubject = {
        _id: mockId,
        id: mockId,
        user: userId,
        name,
        code: code || '',
        color: color || '#6366f1',
        targetHours: targetHours ? Number(targetHours) : 20,
        completedHours: 0,
        deadline: new Date(deadline),
        difficulty: difficulty || 'Medium',
        topics: formattedTopics,
        notes: notes || '',
        createdAt: new Date()
      };
      inMemoryStore.subjects.unshift(newSubject);
      return res.status(201).json({ message: 'Subject created successfully', subject: newSubject });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating subject', error: error.message });
  }
};

// Update subject details or topics
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const { isConnectedToMongo } = getDBState();

    if (isConnectedToMongo) {
      const subject = await Subject.findOne({ _id: id, user: userId });
      if (!subject) return res.status(404).json({ message: 'Subject not found' });

      Object.assign(subject, updates);
      await subject.save();
      return res.json({ message: 'Subject updated successfully', subject });
    } else {
      const subjectIndex = inMemoryStore.subjects.findIndex(s => (s._id === id || s.id === id) && s.user === userId);
      if (subjectIndex === -1) return res.status(404).json({ message: 'Subject not found' });

      inMemoryStore.subjects[subjectIndex] = { ...inMemoryStore.subjects[subjectIndex], ...updates };
      return res.json({ message: 'Subject updated successfully', subject: inMemoryStore.subjects[subjectIndex] });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating subject', error: error.message });
  }
};

// Delete subject
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { isConnectedToMongo } = getDBState();

    if (isConnectedToMongo) {
      await Subject.deleteOne({ _id: id, user: userId });
      return res.json({ message: 'Subject deleted successfully' });
    } else {
      inMemoryStore.subjects = inMemoryStore.subjects.filter(s => !( (s._id === id || s.id === id) && s.user === userId ));
      return res.json({ message: 'Subject deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subject', error: error.message });
  }
};
