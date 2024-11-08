import { JobApplication, JobType, JobStatus } from '../../types';

interface RequiredFieldsFormProps {
  formData: JobApplication;
  onUpdate: (name: string, value: any) => void;
}

export function RequiredFieldsForm({ formData, onUpdate }: RequiredFieldsFormProps) {
  return (
    <div className="space-y-6">
      {/* Job Title & Company Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="jobTitle"
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={formData.jobTitle}
            onChange={(e) => onUpdate(e.target.name, e.target.value)}
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="companyName"
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={formData.companyName}
            onChange={(e) => onUpdate(e.target.name, e.target.value)}
            placeholder="e.g., Acme Corp"
          />
        </div>
      </div>

      {/* Location & Remote Section */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Location <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4 items-start">
          <input
            type="text"
            name="location"
            required
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={formData.location}
            onChange={(e) => onUpdate(e.target.name, e.target.value)}
            placeholder="e.g., San Francisco, CA"
          />
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="remote"
              name="remote"
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              checked={formData.remote || false}
              onChange={(e) => onUpdate(e.target.name, e.target.checked)}
            />
            <label htmlFor="remote" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              Remote Position
            </label>
          </div>
        </div>
      </div>

      {/* Job Type & Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Job Type <span className="text-red-500">*</span>
          </label>
          <select
            name="jobType"
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={formData.jobType}
            onChange={(e) => onUpdate(e.target.name, e.target.value)}
          >
            {(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'] as JobType[]).map(type => (
              <option key={type} value={type}>
                {type.toLowerCase().replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={formData.status}
            onChange={(e) => onUpdate(e.target.name, e.target.value)}
          >
            {([
              'WISHLIST',
              'EMAIL_INQUIRY',
              'APPLIED',
              'PHONE_SCREEN',
              'TECHNICAL',
              'ONSITE',
              'OFFER',
              'REJECTED',
              'WITHDRAWN'
            ] as JobStatus[]).map(status => (
              <option key={status} value={status}>
                {status.toLowerCase().replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        <span className="text-red-500">*</span> Required fields
      </p>
    </div>
  );
}
