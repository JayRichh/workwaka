// src/components/JobLookup.tsx

import React, { useState, useEffect } from 'react';
import { JobApplication } from '../types';
import { storage } from '../utils/storage';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface JobLookupProps {
  onSelect: (job: JobApplication) => void;
  selectedJob: JobApplication | null;
}

export function JobLookup({ onSelect, selectedJob }: JobLookupProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredJobs, setFilteredJobs] = useState<JobApplication[]>([]);

  useEffect(() => {
    const allJobs = storage.getApplications();
    if (searchTerm.trim() === '') {
      setFilteredJobs([]);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const results = allJobs.filter(
        (job) =>
          job.jobTitle.toLowerCase().includes(lowerSearch) ||
          job.companyName.toLowerCase().includes(lowerSearch) ||
          job.location.toLowerCase().includes(lowerSearch) ||
          job.tags.some((tag) =>
            tag.toLowerCase().includes(lowerSearch)
          )
      );
      setFilteredJobs(results);
    }
  }, [searchTerm]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon
          className="h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search job applications..."
        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-10 pr-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      />
      {filteredJobs.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {filteredJobs.map((job) => (
            <li
              key={job.id}
              onClick={() => {
                onSelect(job);
                setSearchTerm('');
              }}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                selectedJob?.id === job.id
                  ? 'bg-blue-500 dark:bg-blue-600 text-white'
                  : 'text-gray-900 dark:text-gray-100'
              } hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-200`}
            >
              <div className="flex flex-col">
                <span
                  className={`block truncate ${
                    selectedJob?.id === job.id
                      ? 'font-semibold'
                      : 'font-normal'
                  }`}
                >
                  {job.jobTitle}
                </span>
                <span className={`text-sm ${
                  selectedJob?.id === job.id
                    ? 'text-blue-50 dark:text-blue-200'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {job.companyName}
                </span>
              </div>
              {selectedJob?.id === job.id && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-white">
                  ✓
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
