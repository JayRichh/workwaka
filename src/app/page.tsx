// src/app/page.tsx

'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { JobApplication } from '../types';
import { JobList } from '../components/JobList';
import { JobForm } from '../components/JobForm';
import { Reports } from '../components/Reports';
import { Calendar } from '../components/Calendar';
import { Modal } from '../components/Modal';
import {
  PlusIcon,
  ChartBarIcon,
  CalendarIcon,
  ClipboardIcon,
} from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Home() {
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleAddNew = (date?: Date) => {
    setSelectedJob(null);
    setSelectedDate(date || null);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setSelectedJob(null);
    setSelectedDate(null);
    setIsModalOpen(false);
  };

  const handleJobSelect = (job: JobApplication) => {
    setSelectedJob(job);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  const tabs = [
    { name: 'applications', icon: ClipboardIcon },
    { name: 'calendar', icon: CalendarIcon },
    { name: 'reports', icon: ChartBarIcon },
  ];

  return (
    <div className="min-h-screen">
      <header className="bg-gray-900 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-white">WorkWaka</h1>
              <p className="mt-1 text-sm text-gray-400">
                Track and manage your job applications
              </p>
            </div>
            <button
              onClick={() => handleAddNew()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              Add Application
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-800 p-1 shadow">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    'flex items-center justify-center gap-2',
                    selected
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  )
                }
              >
                <tab.icon className="h-5 w-5" aria-hidden="true" />
                <span>{tab.name}</span>
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-4">
            <Tab.Panel
              className={classNames(
                'bg-gray-900 rounded-lg shadow',
                'transform transition-all duration-200 ease-in-out',
                'translate-y-0 opacity-100',
                'ui-not-selected:translate-y-2 ui-not-selected:opacity-0'
              )}
            >
              <JobList onSelect={handleJobSelect} />
            </Tab.Panel>
            <Tab.Panel
              className={classNames(
                'bg-gray-900 rounded-lg shadow',
                'transform transition-all duration-200 ease-in-out',
                'translate-y-0 opacity-100',
                'ui-not-selected:translate-y-2 ui-not-selected:opacity-0'
              )}
            >
              <Calendar
                onAddApplication={handleAddNew}
                onSelectApplication={handleJobSelect}
              />
            </Tab.Panel>
            <Tab.Panel
              className={classNames(
                'bg-gray-900 rounded-lg shadow',
                'transform transition-all duration-200 ease-in-out',
                'translate-y-0 opacity-100',
                'ui-not-selected:translate-y-2 ui-not-selected:opacity-0'
              )}
            >
              <Reports />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedJob ? 'Edit Application' : 'New Application'}
      >
        <JobForm
          job={selectedJob}
          initialDate={selectedDate}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
      </main>
    </div>
  );
}
