import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Card, { CardBody } from '../common/Card';
import Button from '../common/Button';

const categoryColors = {
  Food: 'bg-green-100 text-green-800',
  Transport: 'bg-blue-100 text-blue-800',
  Shopping: 'bg-purple-100 text-purple-800',
  Bills: 'bg-red-100 text-red-800',
  Other: 'bg-gray-100 text-gray-800',
};

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const { title, amount, category, date } = expense;
  const formattedDate = new Date(date).toLocaleDateString();
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {formattedAmount}
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  categoryColors[category]
                }`}
              >
                {category}
              </span>
              <span className="text-sm text-gray-500">{formattedDate}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(expense)}
              className="group"
            >
              <PencilIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(expense._id)}
              className="group"
            >
              <TrashIcon className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ExpenseCard;
