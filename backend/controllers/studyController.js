const StudySession = require('../models/StudySession');
const Subject = require('../models/Subject');
const Task = require('../models/Task');
const User = require('../models/User');
const { getDBState, inMemoryStore } = require('../config/db');

// Log a completed focus study session
exports.logSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subjectId, subjectName, durationMinutes, notes, confidenceRating, sessionType } = req.body;

    if (!durationMinutes || Number(durationMinutes) <= 0) {
      return res.status(400).json({ message: 'Valid study duration in minutes is required' });
    }

    const durationHrs = Number(durationMinutes) / 60;
    const { isConnectedToMongo } = getDBState();

    if (isConnectedToMongo) {
      // 1. Create Study Session record
      const session = await StudySession.create({
        user: userId,
        subject: subjectId || null,
        subjectName: subjectName || 'General Study',
        durationMinutes: Number(durationMinutes),
        notes: notes || '',
        confidenceRating: confidenceRating ? Number(confidenceRating) : 4,
        sessionType: sessionType || 'focus_session',
        date: new Date()
      });

      // 2. Automatically update subject's completed hours
      if (subjectId) {
        const subject = await Subject.findById(subjectId);
        if (subject) {
          subject.completedHours = parseFloat((subject.completedHours + durationHrs).toFixed(2));
          await subject.save();
        }
      }

      return res.status(201).json({ message: 'Study session logged successfully!', session });
    } else {
      // In-Memory Mode
      const mockId = 'ses_' + Date.now();
      const session = {
        _id: mockId,
        id: mockId,
        user: userId,
        subject: subjectId || null,
        subjectName: subjectName || 'General Study',
        durationMinutes: Number(durationMinutes),
        notes: notes || '',
        confidenceRating: confidenceRating ? Number(confidenceRating) : 4,
        sessionType: sessionType || 'focus_session',
        date: new Date()
      };
      inMemoryStore.sessions.unshift(session);

      // Update in-memory subject completed hours
      if (subjectId) {
        const subject = inMemoryStore.subjects.find(s => (s._id === subjectId || s.id === subjectId) && s.user === userId);
        if (subject) {
          subject.completedHours = parseFloat(((subject.completedHours || 0) + durationHrs).toFixed(2));
        }
      }

      return res.status(201).json({ message: 'Study session logged successfully! (In-Memory)', session });
    }
  } catch (error) {
    console.error('Log Session Error:', error);
    res.status(500).json({ message: 'Error logging study session', error: error.message });
  }
};

// GET Automated Daily Study Recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isConnectedToMongo } = getDBState();

    let subjects = [];
    let recentSessions = [];
    let userGoalHours = 3;

    if (isConnectedToMongo) {
      subjects = await Subject.find({ user: userId });
      recentSessions = await StudySession.find({ user: userId }).sort({ date: -1 }).limit(20);
      const user = await User.findById(userId);
      if (user && user.dailyGoalHours) userGoalHours = user.dailyGoalHours;
    } else {
      subjects = inMemoryStore.subjects.filter(s => s.user === userId);
      recentSessions = inMemoryStore.sessions.filter(s => s.user === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
      const user = inMemoryStore.users.find(u => u.id === userId || u._id === userId);
      if (user && user.dailyGoalHours) userGoalHours = user.dailyGoalHours;
    }

    if (!subjects || subjects.length === 0) {
      return res.json({
        dailyGoalHours: userGoalHours,
        recommendations: [],
        message: 'No subjects added yet. Add your courses/subjects to generate an AI study plan!'
      });
    }

    const now = new Date();

    // Calculate Priority Score for each subject:
    // Score = (Urgency Multiplier) * (Progress Lag Score) * (Spaced Repetition Bonus)
    const scoredSubjects = subjects.map(sbj => {
      const remainingHours = Math.max(0, sbj.targetHours - (sbj.completedHours || 0));
      const progressPercent = sbj.targetHours > 0 ? (sbj.completedHours / sbj.targetHours) * 100 : 100;

      // 1. Urgency: Days left until deadline
      const deadlineDate = new Date(sbj.deadline);
      const daysUntilDeadline = Math.max(1, Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24)));
      const urgencyFactor = Math.max(1, 30 / daysUntilDeadline);

      // 2. Days since last study session for this subject
      const lastSession = recentSessions.find(s => (s.subject === sbj._id?.toString() || s.subject === sbj.id || s.subjectName === sbj.name));
      let daysSinceLastStudy = 5;
      if (lastSession) {
        daysSinceLastStudy = Math.max(0, (now - new Date(lastSession.date)) / (1000 * 60 * 60 * 24));
      }
      const memoryDecayBonus = 1 + (daysSinceLastStudy * 0.2); // boost if not studied recently

      // Priority Score
      const priorityScore = (remainingHours + 1) * urgencyFactor * memoryDecayBonus;

      return {
        subjectId: sbj._id || sbj.id,
        subjectName: sbj.name,
        color: sbj.color,
        remainingHours,
        progressPercent: Math.round(progressPercent),
        daysUntilDeadline,
        daysSinceLastStudy: Math.round(daysSinceLastStudy),
        priorityScore
      };
    });

    // Sort by highest priority score
    scoredSubjects.sort((a, b) => b.priorityScore - a.priorityScore);

    // Allocate user's daily goal hours proportionally among top subjects
    const totalGoalMinutes = userGoalHours * 60;
    const topSubjects = scoredSubjects.slice(0, 3);
    const totalTopScore = topSubjects.reduce((acc, s) => acc + s.priorityScore, 0);

    const recommendations = topSubjects.map(s => {
      const share = totalTopScore > 0 ? s.priorityScore / totalTopScore : 1 / topSubjects.length;
      let allocatedMinutes = Math.round((totalGoalMinutes * share) / 15) * 15; // round to nearest 15m
      allocatedMinutes = Math.max(30, allocatedMinutes); // min 30 min session

      return {
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        color: s.color,
        allocatedMinutes,
        allocatedHours: (allocatedMinutes / 60).toFixed(1),
        reason: s.daysUntilDeadline < 7 
          ? `⚠️ Urgent: Deadline in ${s.daysUntilDeadline} days!`
          : s.daysSinceLastStudy > 3 
            ? `🔄 Revision Due: Haven't studied in ${s.daysSinceLastStudy} days`
            : `🎯 Focus: ${s.remainingHours.toFixed(1)} target hours remaining`
      };
    });

    return res.json({
      dailyGoalHours: userGoalHours,
      recommendations,
      message: `Today's smart study plan generated based on deadlines, remaining hours, and revision cycles!`
    });
  } catch (error) {
    console.error('Recommendation Error:', error);
    res.status(500).json({ message: 'Error generating study recommendations', error: error.message });
  }
};

// GET Overall Study Analytics and Streak
exports.getStudyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isConnectedToMongo } = getDBState();

    let sessions = [];
    let subjects = [];

    if (isConnectedToMongo) {
      sessions = await StudySession.find({ user: userId }).sort({ date: -1 });
      subjects = await Subject.find({ user: userId });
    } else {
      sessions = inMemoryStore.sessions.filter(s => s.user === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
      subjects = inMemoryStore.subjects.filter(s => s.user === userId);
    }

    // 1. Calculate total minutes and hours
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // 2. Calculate Today's study minutes
    const todayStr = new Date().toISOString().split('T')[0];
    const todayMinutes = sessions
      .filter(s => new Date(s.date).toISOString().split('T')[0] === todayStr)
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    // 3. Calculate Streak (consecutive study days)
    const uniqueDays = Array.from(new Set(sessions.map(s => new Date(s.date).toISOString().split('T')[0]))).sort().reverse();
    let streakDays = 0;
    const checkDate = new Date();

    for (let i = 0; i < 30; i++) {
      const dateKey = checkDate.toISOString().split('T')[0];
      if (uniqueDays.includes(dateKey)) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // If haven't studied today yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayKey = checkDate.toISOString().split('T')[0];
        if (!uniqueDays.includes(yesterdayKey)) break;
      } else {
        break;
      }
    }

    // 4. Subject breakdown (convert hours to completedMinutes and targetMinutes for clean display)
    const subjectDistribution = subjects.map(sbj => {
      const compMins = Math.round((sbj.completedHours || 0) * 60);
      const targetMins = Math.round((sbj.targetHours || 1) * 60);
      return {
        name: sbj.name,
        color: sbj.color,
        completedHours: sbj.completedHours || 0,
        targetHours: sbj.targetHours || 1,
        completedMinutes: compMins,
        targetMinutes: targetMins
      };
    });

    return res.json({
      totalHours,
      totalMinutes,
      todayMinutes,
      todayHours: (todayMinutes / 60).toFixed(1),
      streakDays,
      totalSessionsCount: sessions.length,
      subjectDistribution,
      recentSessions: sessions.slice(0, 8)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching study stats', error: error.message });
  }
};
