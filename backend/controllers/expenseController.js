const Expense = require('../models/Expense');

// @desc Get all expenses for logged-in user
// @route GET /api/expenses
// @access Private
const getExpenses = async (req, res) => {
  const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
  res.json(expenses);
};

// @desc Add new expense
// @route POST /api/expenses
// @access Private
const addExpense = async (req, res) => {
  const { title, amount, category } = req.body;

  if (!title || !amount) {
    return res.status(400).json({ message: 'Title and amount are required' });
  }

  const expense = await Expense.create({
    user: req.user.id,
    title,
    amount,
    category
  });

  res.status(201).json(expense);
};

// @desc Update expense
// @route PUT /api/expenses/:id
// @access Private
const updateExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  if (expense.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const updatedExpense = await Expense.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedExpense);
};

// @desc Delete expense
// @route DELETE /api/expenses/:id
// @access Private
const deleteExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  if (expense.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  await expense.remove();
  res.json({ message: 'Expense removed' });
};

module.exports = { getExpenses, addExpense, updateExpense, deleteExpense };
