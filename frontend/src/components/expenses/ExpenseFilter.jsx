import { useState } from 'react';
import Button from '../common/Button';

const categories = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Other'];

const ExpenseFilter = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    category: 'All',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      category: 'All',
      startDate: '',
      endDate: '',
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:flex sm:space-x-4 sm:space-y-0">
      <div className="flex-1 sm:max-w-xs">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 sm:max-w-xs">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Start Date"
        />
      </div>

      <div className="flex-1 sm:max-w-xs">
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="End Date"
        />
      </div>

      <div className="flex space-x-2">
        <Button type="submit" variant="primary">
          Filter
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </form>
  );
};

export default ExpenseFilter;
