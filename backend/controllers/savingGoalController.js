const SavingGoal = require('../models/SavingGoal');

// @desc    Get all saving goals with filtering
// @route   GET /api/savinggoals
// @access  Private
const getSavingGoals = async (req, res) => {
  try {
    const { achieved, sortBy = 'deadline' } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    if (achieved !== undefined) {
      query.achieved = achieved === 'true';
    }

    const goals = await SavingGoal.find(query)
      .sort({ [sortBy]: 1 });

    // Calculate progress percentage for each goal
    const goalsWithProgress = goals.map(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      return {
        ...goal._doc,
        progress: Math.min(Math.round(progress), 100)
      };
    });

    res.json(goalsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add saving goal
// @route   POST /api/savinggoals
// @access  Private
const addSavingGoal = async (req, res) => {
  try {
    const { title, targetAmount, currentAmount = 0, deadline } = req.body;

    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({ message: 'Title, target amount, and deadline are required' });
    }

    const goal = await SavingGoal.create({
      user: req.user.id,
      title,
      targetAmount,
      currentAmount,
      deadline,
      achieved: currentAmount >= targetAmount
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update saving goal
// @route   PUT /api/savinggoals/:id
// @access  Private
const updateSavingGoal = async (req, res) => {
  try {
    const goal = await SavingGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Saving goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if the goal is achieved based on currentAmount
    if (req.body.currentAmount) {
      req.body.achieved = req.body.currentAmount >= (req.body.targetAmount || goal.targetAmount);
    }

    const updatedGoal = await SavingGoal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete saving goal
// @route   DELETE /api/savinggoals/:id
// @access  Private
const deleteSavingGoal = async (req, res) => {
  try {
    const goal = await SavingGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Saving goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await goal.deleteOne();
    res.json({ message: 'Saving goal removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get saving goals summary
// @route   GET /api/savinggoals/summary
// @access  Private
const getSavingGoalsSummary = async (req, res) => {
  try {
    const summary = await SavingGoal.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalGoals: { $sum: 1 },
          achievedGoals: { $sum: { $cond: ['$achieved', 1, 0] } },
          totalTargetAmount: { $sum: '$targetAmount' },
          totalCurrentAmount: { $sum: '$currentAmount' }
        }
      }
    ]);

    // Get goals near deadline (within next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingDeadlines = await SavingGoal.find({
      user: req.user.id,
      achieved: false,
      deadline: { $lte: thirtyDaysFromNow }
    }).sort({ deadline: 1 });

    res.json({
      summary: summary[0] || {
        totalGoals: 0,
        achievedGoals: 0,
        totalTargetAmount: 0,
        totalCurrentAmount: 0
      },
      upcomingDeadlines
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getSavingGoals, 
  addSavingGoal, 
  updateSavingGoal, 
  deleteSavingGoal,
  getSavingGoalsSummary
};
