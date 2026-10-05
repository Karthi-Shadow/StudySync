const Task = require('../models/Task');
const { getDBState, inMemoryStore } = require('../config/db');

// Get all tasks for user
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, subjectId } = req.query;
    const { isConnectedToMongo } = getDBState();

    if (isConnectedToMongo) {
      let query = { user: userId };
      if (status) query.status = status;
      if (subjectId) query.subject = subjectId;

      const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: -1 });
      return res.json({ tasks });
    } else {
      let tasks = inMemoryStore.tasks.filter(t => t.user === userId);
      if (status) tasks = tasks.filter(t => t.status === status);
      if (subjectId) tasks = tasks.filter(t => t.subject === subjectId);
      return res.json({ tasks });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

// Create a task
exports.createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, subjectId, subjectName, priority, dueDate, estimatedMinutes } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const { isConnectedToMongo } = getDBState();

    if (isConnectedToMongo) {
      const newTask = await Task.create({
        user: userId,
        subject: subjectId || null,
        subjectName: subjectName || 'General',
        title,
        description: description || '',
        status: 'todo',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : 60
      });
      return res.status(201).json({ message: 'Task created', task: newTask });
    } else {
      const mockId = 'tsk_' + Date.now();
      const newTask = {
        _id: mockId,
        id: mockId,
        user: userId,
        subject: subjectId || null,
        subjectName: subjectName || 'General',
        title,
        description: description || '',
        status: 'todo',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : 60,
        createdAt: new Date()
      };
      inMemoryStore.tasks.unshift(newTask);
      return res.status(201).json({ message: 'Task created', task: newTask });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// Update task status or info
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const { isConnectedToMongo } = getDBState();

    if (isConnectedToMongo) {
      const task = await Task.findOne({ _id: id, user: userId });
      if (!task) return res.status(404).json({ message: 'Task not found' });

      Object.assign(task, updates);
      await task.save();
      return res.json({ message: 'Task updated', task });
    } else {
      const taskIndex = inMemoryStore.tasks.findIndex(t => (t._id === id || t.id === id) && t.user === userId);
      if (taskIndex === -1) return res.status(404).json({ message: 'Task not found' });

      inMemoryStore.tasks[taskIndex] = { ...inMemoryStore.tasks[taskIndex], ...updates };
      return res.json({ message: 'Task updated', task: inMemoryStore.tasks[taskIndex] });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { isConnectedToMongo } = getDBState();

    if (isConnectedToMongo) {
      await Task.deleteOne({ _id: id, user: userId });
      return res.json({ message: 'Task deleted' });
    } else {
      inMemoryStore.tasks = inMemoryStore.tasks.filter(t => !( (t._id === id || t.id === id) && t.user === userId ));
      return res.json({ message: 'Task deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};
