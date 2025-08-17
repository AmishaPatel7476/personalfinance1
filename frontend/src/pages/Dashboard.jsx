import { useState, useEffect } from 'react';
import API from '../services/api';

const Dashboard = () => {
  const [expenseStats, setExpenseStats] = useState(null);
  const [savingsGoals, setSavingsGoals] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const [expensesRes, savingsGoalsRes] = await Promise.all([
          API.get('/api/expenses'),
          API.get('/api/saving-goals')
        ]);

        // Process expenses data to calculate stats
        const expenses = expensesRes.data.expenses || expensesRes.data || [];
        
        // Calculate summary statistics
        const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const avgAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;
        const count = expenses.length;
        
        // Calculate category distribution
        const categoryMap = {};
        expenses.forEach(expense => {
          const category = expense.category || 'Uncategorized';
          categoryMap[category] = (categoryMap[category] || 0) + (expense.amount || 0);
        });
        
        const categories = Object.entries(categoryMap).map(([category, amount]) => ({
          category,
          amount
        }));

        // Set expense stats
        setExpenseStats({
          summary: { totalAmount, avgAmount, count },
          categories,
          trends: [] // We'll keep this empty for now
        });
        
        setSavingsGoals({ goals: savingsGoalsRes.data });
        setRecentExpenses(expenses.slice(0, 5)); // Get first 5 expenses
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default values if API calls fail
        setExpenseStats({ 
          summary: { totalAmount: 0, avgAmount: 0, count: 0 },
          categories: [],
          trends: []
        });
        setSavingsGoals({ goals: [] });
        setRecentExpenses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Welcome to your financial overview</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Expenses Card */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Total Expenses</h2>
          <div className="mt-4">
            <p className="text-3xl font-bold text-gray-900">
              ${expenseStats?.summary?.totalAmount?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Average: ${expenseStats?.summary?.avgAmount?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-500">
              Total Transactions: {expenseStats?.summary?.count || 0}
            </p>
            <div className="mt-4 space-y-2">
              {expenseStats?.categories?.map((cat) => (
                <div key={cat.category} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{cat.category || 'Uncategorized'}</span>
                  <span className="font-medium">${cat.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Savings Goals Card */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Savings Goals</h2>
          <div className="mt-4 space-y-4">
            {savingsGoals?.goals?.map((goal) => (
              <div key={goal._id} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{goal.title}</span>
                  <span className="font-medium">
                    ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {(!savingsGoals?.goals || savingsGoals.goals.length === 0) && (
              <p className="text-gray-500 text-sm">No savings goals yet</p>
            )}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <div className="mt-4 space-y-4">
            {recentExpenses.map((expense) => (
              <div key={expense._id} className="flex justify-between items-start">
                <div>
                  <p className="text-gray-900">{expense.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-medium text-gray-900">
                  ${expense.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {recentExpenses.length === 0 && (
              <p className="text-gray-500 text-sm">No recent expenses</p>
            )}
          </div>
        </div>
      </div>

      {/* Expense Trends Chart */}
      {expenseStats?.trends && expenseStats.trends.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Expense Trends</h2>
          <div className="space-y-3">
            {expenseStats.trends.slice(-7).map((trend) => (
              <div key={trend.date} className="flex items-center space-x-4">
                <div className="w-24 text-sm text-gray-600">
                  {new Date(trend.date).toLocaleDateString()}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full" 
                    style={{ 
                      width: `${Math.min((trend.amount / Math.max(...expenseStats.trends.map(t => t.amount))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="w-20 text-right text-sm font-medium">
                  ${trend.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
