import { JobApplication, CompanySize } from '../../types';

interface OptionalFieldsFormProps {
  formData: JobApplication;
  onUpdate: (name: string, value: any) => void;
}

export function OptionalFieldsForm({ formData, onUpdate }: OptionalFieldsFormProps) {
  return (
    <div className="space-y-6">
      {/* Company Details Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Company Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Company Size
            </label>
            <div className="relative">
              <select
                name="companySize"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 appearance-none pr-10"
                value={formData.companySize || ''}
                onChange={(e) => onUpdate(e.target.name, e.target.value)}
              >
                <option value="">Select size</option>
                {(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'] as CompanySize[]).map(size => (
                  <option key={size} value={size}>
                    {size === 'STARTUP' ? '1-10 employees (Startup)' :
                     size === 'SMALL' ? '11-50 employees (Small)' :
                     size === 'MEDIUM' ? '51-200 employees (Medium)' :
                     size === 'LARGE' ? '201-1000 employees (Large)' :
                     '1000+ employees (Enterprise)'}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Helps track the type of companies you're applying to
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Industry
            </label>
            <input
              type="text"
              name="industry"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={formData.industry || ''}
              onChange={(e) => onUpdate(e.target.name, e.target.value)}
              placeholder="e.g., Technology, Healthcare, Finance"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional: Specify the company's industry sector
            </p>
          </div>
        </div>
      </div>

      {/* Application Source Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Application Source</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Source
            </label>
            <input
              type="text"
              name="source"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={formData.source || ''}
              onChange={(e) => onUpdate(e.target.name, e.target.value)}
              placeholder="e.g., LinkedIn, Company Website, Referral"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Where you found this job opportunity
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Job URL
            </label>
            <input
              type="url"
              name="url"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={formData.url || ''}
              onChange={(e) => onUpdate(e.target.name, e.target.value)}
              placeholder="https://"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Link to the job posting or application page
            </p>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      {!formData.companySize && !formData.source && !formData.url && (
        <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Why add these details?</h3>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Track which job boards yield the most opportunities</li>
                  <li>Analyze patterns in company sizes you're targeting</li>
                  <li>Keep direct links to job postings for quick reference</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
