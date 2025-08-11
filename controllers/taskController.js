const Task = require('../models/Task');

// Generate unique task ID
const generateTaskId = async () => {
  const count = await Task.countDocuments();
  return `TASK-${String(count + 1).padStart(4, '0')}`;
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { projectId, task, description, taskType, priority, status, assignedTo, reporter, startDate, eta, estimatedHours, remark, roadBlock, supportNeeded, labels, parentTask, sprint } = req.body;
    
    // Validate required fields
    if (!projectId || !task || !assignedTo || !reporter || !eta) {
      return res.status(400).json({ 
        error: 'projectId, task, assignedTo, reporter, and eta are required' 
      });
    }

    // Generate unique task ID
    const id = await generateTaskId();
    
    const taskData = {
      id,
      projectId,
      task,
      description,
      taskType,
      priority,
      status,
      assignedTo,
      reporter,
      startDate: startDate ? new Date(startDate) : null,
      eta: new Date(eta),
      estimatedHours,
      remark,
      roadBlock,
      supportNeeded,
      labels: labels || [],
      parentTask,
      sprint
    };

    const newTask = await Task.create(taskData);
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { task, description, taskType, priority, status, assignedTo, reporter, startDate, eta, estimatedHours, actualHours, remark, roadBlock, supportNeeded, labels, attachments, relatedTasks, parentTask, sprint } = req.body;
    
    const updateData = {};
    
    if (task !== undefined) updateData.task = task;
    if (description !== undefined) updateData.description = description;
    if (taskType !== undefined) updateData.taskType = taskType;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (reporter !== undefined) updateData.reporter = reporter;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (eta !== undefined) updateData.eta = new Date(eta);
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
    if (actualHours !== undefined) updateData.actualHours = actualHours;
    if (remark !== undefined) updateData.remark = remark;
    if (roadBlock !== undefined) updateData.roadBlock = roadBlock;
    if (supportNeeded !== undefined) updateData.supportNeeded = supportNeeded;
    if (labels !== undefined) updateData.labels = labels;
    if (attachments !== undefined) updateData.attachments = attachments;
    if (relatedTasks !== undefined) updateData.relatedTasks = relatedTasks;
    if (parentTask !== undefined) updateData.parentTask = parentTask;
    if (sprint !== undefined) updateData.sprint = sprint;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
