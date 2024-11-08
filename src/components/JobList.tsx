// src/components/JobList.tsx

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { JobApplication, JobStatus, JobType, CompanySize } from '../types';
import { storage } from '../utils/storage';
import { MagnifyingGlassIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon, ArrowUpIcon, ArrowDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FilterBadge } from './FilterBadge';

const STATUS_COLORS: Record<JobStatus, { bg: string; text: string }> = {
  'WISHLIST': { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-100' },
  'EMAIL_INQUIRY': { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-100' },
  'APPLIED': { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-100' },
  'PHONE_SCREEN': { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-800 dark:text-indigo-100' },
  'TECHNICAL': { bg: 'bg-cyan-100 dark:bg-cyan-900', text: 'text-cyan-800 dark:text-cyan-100' },
  'ONSITE': { bg: 'bg-pink-100 dark:bg-pink-900', text: 'text-pink-800 dark:text-pink-100' },
  'OFFER': { bg: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-emerald-800 dark:text-emerald-100' },
  'REJECTED': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-100' },
  'WITHDRAWN': { bg: 'bg-gray-100 dark:bg-gray-900', text: 'text-gray-800 dark:text-gray-100' }
};

interface Filters {
  search: string;
  status: JobStatus | '';
  jobType: JobType | '';
  companySize: CompanySize | '';
  remote: boolean | null;
  dateRange: { start: string; end: string } | null;
}

interface SortConfig {
  key: keyof JobApplication;
  direction: 'asc' | 'desc';
}

interface JobListProps {
  onSelect: (job: JobApplication) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_ITEMS_PER_PAGE = 25;

export function JobList({ onSelect }: JobListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'dateModified',
    direction: 'desc'
  });
  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') as JobStatus) || '',
    jobType: (searchParams.get('jobType') as JobType) || '',
    companySize: (searchParams.get('companySize') as CompanySize) || '',
    remote: searchParams.get('remote') === 'true' ? true : searchParams.get('remote') === 'false' ? false : null,
    dateRange: null
  });

  useEffect(() => {
    const loadJobs = () => {
      const allJobs = storage.getApplications();
      setJobs(allJobs);
    };

    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.jobType) params.set('jobType', filters.jobType);
    if (filters.companySize) params.set('companySize', filters.companySize);
    if (filters.remote !== null) params.set('remote', String(filters.remote));
    if (currentPage > 1) params.set('page', String(currentPage));
    params.set('perPage', String(itemsPerPage));
    params.set('sortKey', sortConfig.key);
    params.set('sortDir', sortConfig.direction);

    router.push(`?${params.toString()}`);
  }, [filters, currentPage, itemsPerPage, sortConfig, router]);

  const handleSort = (key: keyof JobApplication) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDelete = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    storage.deleteApplication(jobId);
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const filteredAndSortedJobs = useMemo(() => {
    return jobs
      .filter(job => {
        const matchesSearch = !filters.search || 
          job.companyName.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.jobTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.location.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.tags.some((tag) =>
            tag.toLowerCase().includes(filters.search.toLowerCase())
          );
        
        const matchesStatus = !filters.status || job.status === filters.status;
        const matchesJobType = !filters.jobType || job.jobType === filters.jobType;
        const matchesCompanySize = !filters.companySize || job.companySize === filters.companySize;
        const matchesRemote = filters.remote === null || job.remote === filters.remote;
        
        return matchesSearch && matchesStatus && matchesJobType && matchesCompanySize && matchesRemote;
      })
      .sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === bValue) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
  }, [jobs, filters, sortConfig]);

  const paginatedJobs = filteredAndSortedJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAndSortedJobs.length / itemsPerPage);

  const SortIcon = ({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) => (
    <span className={`inline-flex ml-2 ${active ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400'}`}>
      {direction === 'asc' ? (
        <ArrowUpIcon className="h-4 w-4" />
      ) : (
        <ArrowDownIcon className="h-4 w-4" />
      )}
    </span>
  );

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex-1 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Search jobs..."
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1.5 pl-10 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <select
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              {ITEMS_PER_PAGE_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option} per page
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FunnelIcon className="h-5 w-5 mr-1" aria-hidden="true" />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as JobStatus }))}
            >
              <option value="">All Statuses</option>
              {Object.keys(STATUS_COLORS).map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>

            <select
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              value={filters.jobType}
              onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value as JobType }))}
            >
              <option value="">All Job Types</option>
              {(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'] as JobType[]).map(type => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>

            <select
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              value={filters.companySize || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, companySize: e.target.value as CompanySize }))}
            >
              <option value="">All Company Sizes</option>
              {(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'] as CompanySize[]).map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            <select
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              value={filters.remote === null ? '' : String(filters.remote)}
              onChange={(e) => setFilters(prev => ({ ...prev, remote: e.target.value === '' ? null : e.target.value === 'true' }))}
            >
              <option value="">All Locations</option>
              <option value="true">Remote Only</option>
              <option value="false">On-site Only</option>
            </select>
          </div>
        )}

        {Object.entries(filters).some(([key, value]) => 
          value && key !== 'dateRange' && (key !== 'remote' || value !== null)
        ) && (
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <FilterBadge
                label="Search"
                value={filters.search}
                onRemove={() => setFilters(prev => ({ ...prev, search: '' }))}
              />
            )}
            {filters.status && (
              <FilterBadge
                label="Status"
                value={filters.status.replace('_', ' ')}
                onRemove={() => setFilters(prev => ({ ...prev, status: '' }))}
              />
            )}
            {filters.jobType && (
              <FilterBadge
                label="Job Type"
                value={filters.jobType.replace('_', ' ')}
                onRemove={() => setFilters(prev => ({ ...prev, jobType: '' }))}
              />
            )}
            {filters.companySize && (
              <FilterBadge
                label="Company Size"
                value={filters.companySize}
                onRemove={() => setFilters(prev => ({ ...prev, companySize: '' }))}
              />
            )}
            {filters.remote !== null && (
              <FilterBadge
                label="Remote"
                value={filters.remote ? 'Yes' : 'No'}
                onRemove={() => setFilters(prev => ({ ...prev, remote: null }))}
              />
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700">
        {/* Header - Hidden on mobile, shown on larger screens */}
        <div className="hidden sm:grid sm:grid-cols-12 sm:gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-750">
          <div className="col-span-4 flex items-center cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100" onClick={() => handleSort('jobTitle')}>
            Job Title
            <SortIcon active={sortConfig.key === 'jobTitle'} direction={sortConfig.direction} />
          </div>
          <div className="col-span-2 flex items-center cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100" onClick={() => handleSort('companyName')}>
            Company
            <SortIcon active={sortConfig.key === 'companyName'} direction={sortConfig.direction} />
          </div>
          <div className="col-span-2 text-sm font-medium text-gray-900 dark:text-gray-100">Status</div>
          <div className="col-span-2 flex items-center cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100" onClick={() => handleSort('dateApplied')}>
            Applied Date
            <SortIcon active={sortConfig.key === 'dateApplied'} direction={sortConfig.direction} />
          </div>
          <div className="col-span-2 text-sm font-medium text-gray-900 dark:text-gray-100">Location</div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedJobs.map((job) => (
            <div
              key={job.id}
              className="group px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer relative transition-colors duration-200"
              onClick={() => onSelect(job)}
            >
              {/* Mobile Layout */}
              <div className="sm:hidden space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{job.jobTitle}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{job.companyName}</div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[job.status].bg} ${STATUS_COLORS[job.status].text}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-500 dark:text-gray-400">
                    {format(new Date(job.dateApplied), 'MMM d, yyyy')}
                  </div>
                  <div className="text-gray-900 dark:text-gray-100">
                    {job.location} {job.remote && '(Remote)'}
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:grid sm:grid-cols-12 sm:gap-4">
                <div className="col-span-4">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{job.jobTitle}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{job.jobType.replace('_', ' ')}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-900 dark:text-gray-100">{job.companyName}</div>
                  {job.companySize && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">{job.companySize}</div>
                  )}
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[job.status].bg} ${STATUS_COLORS[job.status].text}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="col-span-2 text-gray-500 dark:text-gray-400">
                  {format(new Date(job.dateApplied), 'MMM d, yyyy')}
                </div>
                <div className="col-span-2">
                  <div className="text-gray-900 dark:text-gray-100">{job.location}</div>
                  {job.remote && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">Remote</div>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => handleDelete(e, job.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          ))}

          {filteredAndSortedJobs.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">
                {jobs.length === 0
                  ? "No job applications yet. Click 'Add Application' to get started!"
                  : 'No jobs found matching your criteria'}
              </p>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredAndSortedJobs.length)}
                </span>{' '}
                of <span className="font-medium">{filteredAndSortedJobs.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                      currentPage === i + 1
                        ? 'z-10 bg-blue-50 dark:bg-blue-900/50 border-blue-500 dark:border-blue-500 text-blue-600 dark:text-blue-200'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
