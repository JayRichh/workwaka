// src/components/AddInterviewForm.tsx

import React, { useState } from 'react';
import { InterviewStage, InterviewType, JobApplication } from '../types';
import { JobLookup } from './JobLookup';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface AddInterviewFormProps {
  onSubmit: (
    job: JobApplication,
    interviewData: Partial<InterviewStage>
  ) => void;
  onCancel: () => void;
  initialDate: Date | null;
}

const INTERVIEW_TYPES: InterviewType[] = [
  'PHONE_SCREEN',
  'TECHNICAL',
  'BEHAVIORAL',
  'SYSTEM_DESIGN',
  'CODING',
  'ONSITE',
  'TEAM_FIT',
  'HIRING_MANAGER',
  'HR_FINAL',
  'OTHER',
];

export function AddInterviewForm({
  onSubmit,
  onCancel,
  initialDate,
}: AddInterviewFormProps) {
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [type, setType] = useState<InterviewType>('PHONE_SCREEN');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(
    initialDate || new Date()
  );
  const [duration, setDuration] = useState<number>(60);
  const [isRemote, setIsRemote] = useState<boolean>(true);
  const [location, setLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !scheduledDate) return;
    onSubmit(selectedJob, {
      type,
      scheduledDate: scheduledDate.toISOString(),
      duration,
      isRemote,
      location,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Job Selection - Full Width */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Select Job Application
        </label>
        <JobLookup
          onSelect={(job) => setSelectedJob(job)}
          selectedJob={selectedJob}
        />
      </div>

      {/* Two Column Layout for Interview Details */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Interview Type and Schedule */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Interview Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as InterviewType)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            >
              {INTERVIEW_TYPES.map((interviewType) => (
                <option key={interviewType} value={interviewType}>
                  {interviewType.toLowerCase().replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Scheduled Date & Time
            </label>
            <ReactDatePicker
              selected={scheduledDate}
              onChange={(date: Date | null) => setScheduledDate(date)}
              showTimeSelect
              timeIntervals={15}
              dateFormat="Pp"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>
        </div>

        {/* Right Column - Location Details */}
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <input
              id="isRemote"
              type="checkbox"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <label htmlFor="isRemote" className="ml-2 text-sm text-gray-900 dark:text-gray-100">
              Remote Interview
            </label>
          </div>

          {!isRemote && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="Interview Location"
                required={!isRemote}
              />
            </div>
          )}
        </div>
      </div>

      {/* Notes Section - Full Width */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          placeholder="Additional notes about the interview"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selectedJob || !scheduledDate}
          className={`px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            !selectedJob || !scheduledDate
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          Add Interview
        </button>
      </div>
    </form>
  );
}
