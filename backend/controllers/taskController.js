const Task = require('../models/Task');

// @desc    Get all tasks for logged-in user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, category, startDate, endDate } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) query.dueDate.$gte = new Date(startDate);
      if (endDate) query.dueDate.$lte = new Date(endDate);
    }

    const tasks = await Task.find(query).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new task
// @route   POST /api/tasks
// @access  Private
const addTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, category, reminderDate } = req.body;

    if (!title || !dueDate || !category) {
      return res.status(400).json({ message: 'Title, due date, and category are required' });
    }

    const task = await Task.create({
      user: req.user.id,
      title,
      description,
      dueDate,
      priority,
      category,
      reminderDate
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check ownership
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get task summary
// @route   GET /api/tasks/summary
// @access  Private
const getTaskSummary = async (req, res) => {
  try {
    const summary = await Task.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          tasks: { $push: '$$ROOT' }
        }
      }
    ]);

    const upcomingTasks = await Task.find({
      user: req.user.id,
      status: { $ne: 'Completed' },
      dueDate: { $gte: new Date() }
    })
    .sort({ dueDate: 1 })
    .limit(5);

    res.json({
      summary,
      upcomingTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  getTaskSummary
};
