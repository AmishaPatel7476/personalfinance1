const SavingGoal = require('../models/SavingGoal');

// @desc Get all saving goals
// @route GET /api/savinggoals
// @access Private
const getSavingGoals = async (req, res) => {
  const goals = await SavingGoal.find({ user: req.user.id }).sort({ deadline: 1 });
  res.json(goals);
};

// @desc Add saving goal
// @route POST /api/savinggoals
// @access Private
const addSavingGoal = async (req, res) => {
  const { title, targetAmount, deadline } = req.body;

  if (!title || !targetAmount || !deadline) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const goal = await SavingGoal.create({
    user: req.user.id,
    title,
    targetAmount,
    deadline
  });

  res.status(201).json(goal);
};

// @desc Update saving goal
// @route PUT /api/savinggoals/:id
// @access Private
const updateSavingGoal = async (req, res) => {
  const goal = await SavingGoal.findById(req.params.id);

  if (!goal) {
    return res.status(404).json({ message: 'Saving goal not found' });
  }

  if (goal.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const updatedGoal = await SavingGoal.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedGoal);
};

// @desc Delete saving goal
// @route DELETE /api/savinggoals/:id
// @access Private
const deleteSavingGoal = async (req, res) => {
  const goal = await SavingGoal.findById(req.params.id);

  if (!goal) {
    return res.status(404).json({ message: 'Saving goal not found' });
  }

  if (goal.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  await goal.remove();
  res.json({ message: 'Saving goal removed' });
};

module.exports = { getSavingGoals, addSavingGoal, updateSavingGoal, deleteSavingGoal };
