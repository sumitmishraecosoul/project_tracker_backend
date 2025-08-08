const UserTask = require('../models/UserTask');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// Get all user tasks with filtering
const getAllUserTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (req.query.userId) filter.user = req.query.userId;
    if (req.query.date) filter.date = new Date(req.query.date);
    if (req.query.typeOfWork) filter.typeOfWork = req.query.typeOfWork;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.project) filter.project = req.query.project;

    const userTasks = await UserTask.find(filter)
      .populate('user', 'name email')
      .populate('project', 'title')
      .populate('task', 'title')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await UserTask.countDocuments(filter);

    res.json({
      userTasks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTasks: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user task by ID
const getUserTaskById = async (req, res) => {
  try {
    const userTask = await UserTask.findById(req.params.id)
      .populate('user', 'name email')
      .populate('project', 'title')
      .populate('task', 'title');

    if (!userTask) {
      return res.status(404).json({ message: 'User task not found' });
    }

    res.json(userTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new user task
const createUserTask = async (req, res) => {
  try {
    const userTaskData = {
      ...req.body,
      user: req.user.id
    };

    const userTask = new UserTask(userTaskData);
    await userTask.save();

    await userTask.populate('user', 'name email');
    await userTask.populate('project', 'title');

    // Create notification
    await Notification.create({
      user: req.user.id,
      type: 'task_assigned',
      title: 'New User Task Created',
      message: `User task for ${userTask.typeOfWork} has been created`,
      relatedId: userTask._id,
      relatedModel: 'UserTask'
    });

    res.status(201).json(userTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user task
const updateUserTask = async (req, res) => {
  try {
    const userTask = await UserTask.findById(req.params.id);
    
    if (!userTask) {
      return res.status(404).json({ message: 'User task not found' });
    }

    if (userTask.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    Object.assign(userTask, req.body);
    userTask.updatedAt = Date.now();
    await userTask.save();

    await userTask.populate('user', 'name email');
    await userTask.populate('project', 'title');

    res.json(userTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user task
const deleteUserTask = async (req, res) => {
  try {
    const userTask = await UserTask.findById(req.params.id);
    
    if (!userTask) {
      return res.status(404).json({ message: 'User task not found' });
    }

    if (userTask.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await UserTask.findByIdAndDelete(req.params.id);
    res.json({ message: 'User task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user tasks by user ID
const getUserTasksByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, typeOfWork, status } = req.query;

    const filter = { user: userId };
    
    if (date) filter.date = new Date(date);
    if (typeOfWork) filter.typeOfWork = typeOfWork;
    if (status) filter.status = status;

    const userTasks = await UserTask.find(filter)
      .populate('project', 'title')
      .populate('task', 'title')
      .sort({ date: -1 });

    res.json(userTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user tasks by date
const getUserTasksByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const { userId } = req.query;

    const filter = { date: new Date(date) };
    if (userId) filter.user = userId;

    const userTasks = await UserTask.find(filter)
      .populate('user', 'name email')
      .populate('project', 'title')
      .populate('task', 'title')
      .sort({ createdAt: -1 });

    res.json(userTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user task summary
const getUserTaskSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const filter = { user: userId };
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const summary = await UserTask.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$typeOfWork',
          count: { $sum: 1 },
          totalHours: { $sum: '$hoursSpent' }
        }
      }
    ]);

    const totalTasks = await UserTask.countDocuments(filter);
    const completedTasks = await UserTask.countDocuments({ ...filter, status: 'Completed' });

    res.json({
      summary,
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUserTasks,
  getUserTaskById,
  createUserTask,
  updateUserTask,
  deleteUserTask,
  getUserTasksByUserId,
  getUserTasksByDate,
  getUserTaskSummary
};
