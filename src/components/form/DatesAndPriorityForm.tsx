import { format } from 'date-fns';
import { JobApplication } from '../../types';

interface DatesAndPriorityFormProps {
  formData: JobApplication;
  onUpdate: (name: string, value: any) => void;
}

export function DatesAndPriorityForm({ formData, onUpdate }: DatesAndPriorityFormProps) {
  return (
    <div className="space-y-6">
      {/* Priority Section */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Priority Level <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            name="priority"
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 appearance-none pr-10"
            value={formData.priority}
            onChange={(e) => onUpdate(e.target.name, e.target.value)}
          >
            <option value="LOW">low priority</option>
            <option value="MEDIUM">medium priority</option>
            <option value="HIGH">high priority</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Application Date Section */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Application Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="dateApplied"
          required
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          value={format(new Date(formData.dateApplied), 'yyyy-MM-dd')}
          onChange={(e) => onUpdate(e.target.name, new Date(e.target.value).toISOString())}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Date when you applied or plan to apply
        </p>
      </div>

      {/* Application Deadline Section */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Application Deadline
        </label>
        <input
          type="date"
          name="applicationDeadline"
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          value={formData.applicationDeadline ? format(new Date(formData.applicationDeadline), 'yyyy-MM-dd') : ''}
          onChange={(e) => onUpdate(e.target.name, e.target.value ? new Date(e.target.value).toISOString() : undefined)}
          min={format(new Date(), 'yyyy-MM-dd')}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Optional: Set if there's a specific deadline
        </p>
      </div>

      {/* Visual Priority Indicator */}
      <div className="mt-4 p-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            formData.priority === 'HIGH' ? 'bg-red-500' :
            formData.priority === 'MEDIUM' ? 'bg-blue-500' :
            'bg-gray-500'
          }`} />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {formData.priority.toLowerCase()} priority application
          </span>
        </div>
        {formData.applicationDeadline && (
          <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
            {new Date(formData.applicationDeadline) < new Date() ? (
              <span className="text-red-600 dark:text-red-400">Deadline passed</span>
            ) : (
              <span>
                Deadline: {format(new Date(formData.applicationDeadline), 'MMM dd, yyyy')}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
