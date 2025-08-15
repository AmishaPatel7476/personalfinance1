const express = require('express');
const router = express.Router();
const { getSavingGoals, addSavingGoal, updateSavingGoal, deleteSavingGoal } = require('../controllers/savingGoalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getSavingGoals)
  .post(protect, addSavingGoal);

router.route('/:id')
  .put(protect, updateSavingGoal)
  .delete(protect, deleteSavingGoal);

module.exports = router;
