const express = require('express');
const router = express.Router();
const { 
  getExpenses, 
  addExpense, 
  updateExpense, 
  deleteExpense,
  getExpenseStats 
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

// Main expense routes
router.route('/')
  .get(protect, getExpenses)
  .post(protect, addExpense);

router.route('/:id')
  .put(protect, updateExpense)
  .delete(protect, deleteExpense);

// Statistics route
router.get('/stats', protect, getExpenseStats);

module.exports = router;
