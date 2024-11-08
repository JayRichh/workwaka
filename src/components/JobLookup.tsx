// src/components/JobLookup.tsx
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { JobApplication } from '../types';
import { storage } from '../utils/storage';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface JobLookupProps {
  onSelect: (job: JobApplication) => void;
  selectedJob: JobApplication | null;
}

const ITEMS_PER_PAGE = 20;

export function JobLookup({ onSelect, selectedJob }: JobLookupProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredJobs, setFilteredJobs] = useState<JobApplication[]>([]);
  const [displayedJobs, setDisplayedJobs] = useState<JobApplication[]>([]);
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLUListElement>(null);

  // Set initial search term from selected job
  useEffect(() => {
    if (selectedJob && !searchTerm) {
      setSearchTerm(`${selectedJob.jobTitle} - ${selectedJob.companyName}`);
    }
  }, [selectedJob]);

  // Filter and sort jobs
  useEffect(() => {
    const allJobs = storage.getApplications();
    if (searchTerm.trim() === '' && !selectedJob) {
      // When no search term and no selection, show all jobs sorted by date
      const sortedJobs = [...allJobs].sort((a, b) => 
        new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime()
      );
      setFilteredJobs(sortedJobs);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const results = allJobs.filter(
        (job) =>
          job.jobTitle.toLowerCase().includes(lowerSearch) ||
          job.companyName.toLowerCase().includes(lowerSearch) ||
          job.location.toLowerCase().includes(lowerSearch) ||
          (job.tags && job.tags.some((tag) =>
            tag.toLowerCase().includes(lowerSearch)
          ))
      ).sort((a, b) => 
        new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime()
      );
      setFilteredJobs(results);
    }
    setPage(1);
  }, [searchTerm, selectedJob]);

  // Update displayed jobs based on page
  useEffect(() => {
    setDisplayedJobs(filteredJobs.slice(0, page * ITEMS_PER_PAGE));
  }, [filteredJobs, page]);

  // Handle scroll for infinite loading
  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (displayedJobs.length < filteredJobs.length) {
        setPage(prev => prev + 1);
      }
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleJobSelect = (job: JobApplication) => {
    onSelect(job);
    setSearchTerm(`${job.jobTitle} - ${job.companyName}`);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    if (!value && selectedJob) {
      onSelect(null as any); // Clear selection if input is cleared
    }
  };

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
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder="Search job applications..."
        className={`block w-full rounded-md border py-2 pl-10 pr-3 ${
          selectedJob 
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
        } text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
      />
      {isOpen && (displayedJobs.length > 0 || searchTerm.trim() !== '') && (
        <ul
          ref={dropdownRef}
          onScroll={handleScroll}
          className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        >
          {displayedJobs.length > 0 ? (
            displayedJobs.map((job) => (
              <li
                key={job.id}
                onClick={() => handleJobSelect(job)}
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
                    {job.companyName} • {new Date(job.dateModified).toLocaleDateString()}
                  </span>
                </div>
                {selectedJob?.id === job.id && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-white">
                    ✓
                  </span>
                )}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              No jobs found
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
