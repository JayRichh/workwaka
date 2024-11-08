import { Salary } from '../../types';

interface SalaryFormProps {
  salary: Salary;
  onUpdate: (field: keyof Salary, value: string) => void;
}

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
  { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: '$' },
  { value: 'AUD', label: 'AUD - Australian Dollar', symbol: '$' },
  { value: 'JPY', label: 'JPY - Japanese Yen', symbol: '¥' },
];

export function SalaryForm({ salary, onUpdate }: SalaryFormProps) {
  const formatSalary = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleSalaryChange = (field: 'min' | 'max', value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    onUpdate(field, numericValue);
  };

  const getSalaryRange = () => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency,
      maximumFractionDigits: 0,
    });

    const min = formatter.format(salary.min);
    const max = formatter.format(salary.max);

    if (salary.min === 0 && salary.max === 0) {
      return 'No salary range specified';
    } else if (salary.min === salary.max) {
      return min;
    }
    return `${min} - ${max}`;
  };

  const getCurrencySymbol = () => {
    const currency = CURRENCY_OPTIONS.find(c => c.value === salary.currency);
    return currency?.symbol || salary.currency;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Compensation</h3>

      {/* Currency Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Currency
        </label>
        <select
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          value={salary.currency}
          onChange={(e) => onUpdate('currency', e.target.value)}
        >
          {CURRENCY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Salary Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Minimum
          </label>
          <div className="relative rounded-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                {getCurrencySymbol()}
              </span>
            </div>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-8 pr-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={formatSalary(salary.min)}
              onChange={(e) => handleSalaryChange('min', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Maximum
          </label>
          <div className="relative rounded-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                {getCurrencySymbol()}
              </span>
            </div>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-8 pr-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={formatSalary(salary.max)}
              onChange={(e) => handleSalaryChange('max', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Salary Summary */}
      <div className="mt-4 p-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm8 0a1 1 0 011-1h.01a1 1 0 110 2H15a1 1 0 01-1-1zm-8 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm8 0a1 1 0 011-1h.01a1 1 0 110 2H15a1 1 0 01-1-1zm-8 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm8 0a1 1 0 011-1h.01a1 1 0 110 2H15a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Salary Range: {getSalaryRange()}
          </span>
        </div>
        {salary.min > salary.max && salary.max !== 0 && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            Note: Minimum salary should not exceed maximum salary
          </p>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Enter the salary range for this position. Leave both fields at 0 if the salary is not specified.
      </p>
    </div>
  );
}
