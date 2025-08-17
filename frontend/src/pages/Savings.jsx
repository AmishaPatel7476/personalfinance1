import { useState, useEffect } from 'react';
import API from '../services/api';

const Savings = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState({ 
    title: '', 
    targetAmount: '', 
    currentAmount: '',
    deadline: ''
  });
  const [editingGoal, setEditingGoal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await API.get('/api/saving-goals');
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newGoal.title.trim()) {
      alert('Please enter a goal name');
      return;
    }
    
    if (!newGoal.targetAmount || parseFloat(newGoal.targetAmount) <= 0) {
      alert('Please enter a valid target amount');
      return;
    }
    
    if (!newGoal.deadline) {
      alert('Please select a deadline');
      return;
    }

    try {
      const goalData = {
        title: newGoal.title.trim(),
        targetAmount: parseFloat(newGoal.targetAmount),
        currentAmount: parseFloat(newGoal.currentAmount) || 0,
        deadline: new Date(newGoal.deadline)
      };
      
      console.log('Sending goal data:', goalData);
      
      const response = await API.post('/api/saving-goals', goalData);
      console.log('Response:', response.data);
      
      setNewGoal({ title: '', targetAmount: '', currentAmount: '', deadline: '' });
      fetchGoals();
      alert('Savings goal created successfully!');
    } catch (error) {
      console.error('Error creating savings goal:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(`Error: ${error.response.data.message || 'Failed to create savings goal'}`);
      } else {
        alert('Error creating savings goal. Please try again.');
      }
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal({
      _id: goal._id,
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline.split('T')[0] // Convert date to YYYY-MM-DD format
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!editingGoal.title.trim()) {
      alert('Please enter a goal name');
      return;
    }
    
    if (!editingGoal.targetAmount || parseFloat(editingGoal.targetAmount) <= 0) {
      alert('Please enter a valid target amount');
      return;
    }
    
    if (!editingGoal.deadline) {
      alert('Please select a deadline');
      return;
    }

    try {
      const goalData = {
        title: editingGoal.title.trim(),
        targetAmount: parseFloat(editingGoal.targetAmount),
        currentAmount: parseFloat(editingGoal.currentAmount) || 0,
        deadline: new Date(editingGoal.deadline)
      };
      
      await API.put(`/api/saving-goals/${editingGoal._id}`, goalData);
      
      setEditingGoal(null);
      setIsEditing(false);
      fetchGoals();
      alert('Savings goal updated successfully!');
    } catch (error) {
      console.error('Error updating savings goal:', error);
      alert('Error updating savings goal. Please try again.');
    }
  };

  const handleDelete = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await API.delete(`/api/saving-goals/${goalId}`);
        fetchGoals();
        alert('Savings goal deleted successfully!');
      } catch (error) {
        console.error('Error deleting savings goal:', error);
        alert('Error deleting savings goal. Please try again.');
      }
    }
  };

  const cancelEdit = () => {
    setEditingGoal(null);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Savings Goals</h1>
        <p className="mt-1 text-gray-500">Track and manage your savings targets</p>
      </div>

      {/* Add New Goal Form */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Goal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Goal Title *
            </label>
            <input
              type="text"
              id="title"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
              Target Amount *
            </label>
            <input
              type="number"
              id="targetAmount"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div>
            <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700">
              Current Amount
            </label>
            <input
              type="number"
              id="currentAmount"
              value={newGoal.currentAmount}
              onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
              Target Deadline *
            </label>
            <input
              type="date"
              id="deadline"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Goal
          </button>
        </form>
      </div>

      {/* Edit Goal Form */}
      {isEditing && editingGoal && (
        <div className="bg-white shadow-sm rounded-lg p-6 border-2 border-blue-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Goal</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700">
                Goal Title *
              </label>
              <input
                type="text"
                id="editTitle"
                value={editingGoal.title}
                onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="editTargetAmount" className="block text-sm font-medium text-gray-700">
                Target Amount *
              </label>
              <input
                type="number"
                id="editTargetAmount"
                value={editingGoal.targetAmount}
                onChange={(e) => setEditingGoal({ ...editingGoal, targetAmount: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label htmlFor="editCurrentAmount" className="block text-sm font-medium text-gray-700">
                Current Amount
              </label>
              <input
                type="number"
                id="editCurrentAmount"
                value={editingGoal.currentAmount}
                onChange={(e) => setEditingGoal({ ...editingGoal, currentAmount: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="editDeadline" className="block text-sm font-medium text-gray-700">
                Target Deadline *
              </label>
              <input
                type="date"
                id="editDeadline"
                value={editingGoal.deadline}
                onChange={(e) => setEditingGoal({ ...editingGoal, deadline: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Update Goal
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal._id} className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                <p className="text-sm text-gray-500">
                  Progress: ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  Deadline: {new Date(goal.deadline).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(goal)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(goal._id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%`,
                  maxWidth: '100%'
                }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              {Math.min((goal.currentAmount / goal.targetAmount) * 100, 100).toFixed(1)}% Complete
            </div>
          </div>
        ))}
        {goals.length === 0 && (
          <div className="bg-white shadow-sm rounded-lg p-6 text-center">
            <p className="text-gray-500">No savings goals yet. Create your first goal above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Savings;
