const mongoose = require('mongoose');

const savingGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please add a saving goal title']
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please add a target amount']
    },
    currentAmount: {
      type: Number,
      default: 0
    },
    deadline: {
      type: Date,
      required: true
    },
    achieved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavingGoal', savingGoalSchema);
