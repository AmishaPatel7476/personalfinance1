const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  getTaskSummary
} = require('../controllers/taskController');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(addTask);

router.route('/summary')
  .get(getTaskSummary);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
