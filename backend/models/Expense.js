const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // already exists in starter code
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please add an expense title']
    },
    amount: {
      type: Number,
      required: [true, 'Please add an expense amount']
    },
    category: {
      type: String,
      enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Other'],
      default: 'Other'
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
