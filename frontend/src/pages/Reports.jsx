import { useState, useEffect } from 'react';
import API from '../services/api';

const Reports = () => {
  const [expenses, setExpenses] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [timeframe, setTimeframe] = useState('month');

  useEffect(() => {
    fetchAllData();
  }, [timeframe]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [expensesRes, savingsRes] = await Promise.all([
        API.get('/api/expenses'),
        API.get('/api/saving-goals')
      ]);
      
      const expensesData = expensesRes.data.expenses || expensesRes.data || [];
      const savingsData = savingsRes.data || [];
      
      setExpenses(expensesData);
      setSavingsGoals(savingsData);
      
      // Process data for reports
      processMonthlyData(expensesData);
      processCategoryData(expensesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setExpenses([]);
      setSavingsGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (expenses) => {
    if (!Array.isArray(expenses)) return;
    
    const monthly = {};
    expenses.forEach(expense => {
      if (expense && expense.date && expense.amount) {
        const date = new Date(expense.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthly[monthYear]) {
          monthly[monthYear] = { total: 0, count: 0 };
        }
        monthly[monthYear].total += expense.amount;
        monthly[monthYear].count += 1;
      }
    });
    setMonthlyData(monthly);
  };

  const processCategoryData = (expenses) => {
    if (!Array.isArray(expenses)) return;
    
    const categories = {};
    expenses.forEach(expense => {
      if (expense && expense.category && expense.amount) {
        if (!categories[expense.category]) {
          categories[expense.category] = 0;
        }
        categories[expense.category] += expense.amount;
      }
    });
    setCategoryData(categories);
  };

  const getTotalExpenses = () => {
    if (!Array.isArray(expenses)) return 0;
    return expenses.reduce((total, expense) => {
      return total + (expense?.amount || 0);
    }, 0);
  };

  const getAverageExpense = () => {
    if (!Array.isArray(expenses) || expenses.length === 0) return 0;
    return getTotalExpenses() / expenses.length;
  };

  const getTotalSavings = () => {
    if (!Array.isArray(savingsGoals)) return 0;
    return savingsGoals.reduce((total, goal) => {
      return total + (goal?.currentAmount || 0);
    }, 0);
  };

  const getTotalSavingsTarget = () => {
    if (!Array.isArray(savingsGoals)) return 0;
    return savingsGoals.reduce((total, goal) => {
      return total + (goal?.targetAmount || 0);
    }, 0);
  };

  const getSavingsProgress = () => {
    const target = getTotalSavingsTarget();
    if (target === 0) return 0;
    return (getTotalSavings() / target) * 100;
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Financial Reports</h1>
            <p className="mt-1 text-gray-500">View your financial analytics and insights</p>
          </div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600">${getTotalExpenses().toFixed(2)}</p>
          <p className="text-sm text-gray-500">All time</p>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Average Expense</h3>
          <p className="text-3xl font-bold text-blue-600">${getAverageExpense().toFixed(2)}</p>
          <p className="text-sm text-gray-500">Per transaction</p>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Savings</h3>
          <p className="text-3xl font-bold text-green-600">${getTotalSavings().toFixed(2)}</p>
          <p className="text-sm text-gray-500">Current amount</p>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Savings Progress</h3>
          <p className="text-3xl font-bold text-purple-600">{getSavingsProgress().toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Target: ${getTotalSavingsTarget().toFixed(2)}</p>
        </div>
      </div>

      {/* Monthly Overview and Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Overview</h2>
          <div className="space-y-3">
            {Object.entries(monthlyData)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 6)
              .map(([month, data]) => (
                <div key={month} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{month}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">${data.total.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">({data.count} transactions)</span>
                  </div>
                </div>
              ))}
            {Object.keys(monthlyData).length === 0 && (
              <p className="text-gray-500 text-center py-4">No monthly data available</p>
            )}
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Category Analysis</h2>
          <div className="space-y-3">
            {Object.entries(categoryData)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{category || 'Uncategorized'}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">${amount.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">
                      ({((amount / getTotalExpenses()) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            {Object.keys(categoryData).length === 0 && (
              <p className="text-gray-500 text-center py-4">No category data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Savings Goals Progress */}
      {savingsGoals.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Savings Goals Progress</h2>
          <div className="space-y-4">
            {savingsGoals.map((goal) => (
              <div key={goal._id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">{goal.title}</span>
                  <span className="text-sm text-gray-600">
                    ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  Progress: {((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {Array.isArray(expenses) && expenses.length > 0 ? (
            expenses.slice(0, 10).map((expense) => (
              <div key={expense._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-red-600">${(expense.amount || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{expense.date ? new Date(expense.date).toLocaleDateString() : 'No date'}</p>
                </div>
                <div className="text-sm text-gray-900">{expense.title}</div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No expenses found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
