const express = require('express');
const router = express.Router();
const { 
  getSavingGoals, 
  addSavingGoal, 
  updateSavingGoal, 
  deleteSavingGoal,
  getSavingGoalsSummary
} = require('../controllers/savingGoalController');
const { protect } = require('../middleware/authMiddleware');

// Main saving goals routes
router.route('/')
  .get(protect, getSavingGoals)
  .post(protect, addSavingGoal);

router.route('/:id')
  .put(protect, updateSavingGoal)
  .delete(protect, deleteSavingGoal);

// Summary route
router.get('/summary', protect, getSavingGoalsSummary);

module.exports = router;
