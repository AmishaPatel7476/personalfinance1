import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import ExpenseCard from '../components/expenses/ExpenseCard';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseFilter from '../components/expenses/ExpenseFilter';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const Expenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    category: 'All',
    startDate: '',
    endDate: '',
  });

  const fetchExpenses = async () => {
    try {
      let url = '/api/expenses';
      const params = new URLSearchParams();
      
      if (filters.category !== 'All') {
        params.append('category', filters.category);
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSubmit = async (formData) => {
    try {
      if (editingExpense) {
        await axiosInstance.put(`/api/expenses/${editingExpense._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
      } else {
        await axiosInstance.post('/api/expenses', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
      }
      fetchExpenses();
      setIsFormOpen(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axiosInstance.delete(`/api/expenses/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Expenses</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your expenses and track your spending
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        </CardHeader>
        <CardBody>
          <ExpenseFilter onFilter={setFilters} />
        </CardBody>
      </Card>

      {/* Expenses List */}
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense._id}
              expense={expense}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      <Dialog
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingExpense(null);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </Dialog.Title>
            <ExpenseForm
              expense={editingExpense}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingExpense(null);
              }}
            />
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Expenses;
