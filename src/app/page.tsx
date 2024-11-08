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
import Image from 'next/image';

function classNames(...classes: string[]): string {
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
    { name: 'Applications', icon: ClipboardIcon },
    { name: 'Calendar', icon: CalendarIcon },
    { name: 'Reports', icon: ChartBarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-0">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full sm:w-auto">
              <div className="w-[180px] h-[82px] relative flex-shrink-0">
                <Image
                  src="/moits.png"
                  alt="WorkWaka Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-3"><i className='text-gray-500'>the</i>WorkWaka</h1>
                <p className="text-base sm:text-lg text-gray-500">
                  Track and manage your job applications
                </p>
              </div>
            </div>
            <button
              onClick={() => handleAddNew()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg
                text-sm font-medium transition-all duration-200
                bg-black text-white hover:bg-gray-800
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900
                shadow-sm
                sm:px-6 sm:py-3 sm:text-base
                active:transform active:scale-95"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Application
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 shadow-sm border border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-black ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2',
                    'flex items-center justify-center gap-2 transition-all duration-200',
                    selected
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )
                }
              >
                <tab.icon className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">{tab.name}</span>
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels className="mt-4">
            {[JobList, Calendar, Reports].map((Component, idx) => (
              <Tab.Panel
                key={idx}
                className={classNames(
                  'bg-white rounded-lg shadow-sm border border-gray-200',
                  'transform transition-all duration-200 ease-in-out',
                  'translate-y-0 opacity-100',
                  'ui-not-selected:translate-y-2 ui-not-selected:opacity-0'
                )}
              >
                {idx === 0 ? (
                  <JobList onSelect={handleJobSelect} />
                ) : idx === 1 ? (
                  <Calendar
                    onAddApplication={handleAddNew}
                    onSelectApplication={handleJobSelect}
                  />
                ) : (
                  <Reports />
                )}
              </Tab.Panel>
            ))}
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
