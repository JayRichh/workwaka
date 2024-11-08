// src/components/form/InterviewStageForm.tsx

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  InterviewStage,
  InterviewType,
  InterviewOutcome,
} from '../../types';
import { MinusIcon } from '@heroicons/react/24/outline';

interface InterviewStageFormProps {
  stage: InterviewStage;
  onUpdate: (
    id: string,
    field: keyof InterviewStage,
    value: any
  ) => void;
  onRemove: (id: string) => void;
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

const INTERVIEW_OUTCOMES: InterviewOutcome[] = [
  'SCHEDULED',
  'PENDING',
  'PASSED',
  'FAILED',
  'CANCELLED',
  'RESCHEDULED',
];

export function InterviewStageForm({
  stage,
  onUpdate,
  onRemove,
}: InterviewStageFormProps) {
  const [scheduledDate, setScheduledDate] = useState<Date | null>(
    parseISO(stage.scheduledDate)
  );
  
  const [endDate, setEndDate] = useState<Date | null>(
    stage.duration
      ? new Date(
          parseISO(stage.scheduledDate).getTime() +
            stage.duration * 60000
        )
      : new Date(
          parseISO(stage.scheduledDate).getTime() + 60 * 60000
        ) // default 60 minutes
  );

  useEffect(() => {
    if (scheduledDate && endDate) {
      const duration = Math.round(
        (endDate.getTime() - scheduledDate.getTime()) / 60000
      );
      onUpdate(stage.id, 'scheduledDate', scheduledDate.toISOString());
      onUpdate(stage.id, 'duration', duration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduledDate, endDate]);

  const handleTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onUpdate(stage.id, 'type', e.target.value as InterviewType);
  };

  const handleOutcomeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onUpdate(stage.id, 'outcome', e.target.value as InterviewOutcome);
  };

  const handleDurationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const duration = Number(e.target.value);
    if (!isNaN(duration) && duration > 0 && scheduledDate) {
      setEndDate(
        new Date(scheduledDate.getTime() + duration * 60000)
      );
      onUpdate(stage.id, 'duration', duration);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Type
        </label>
        <select
          value={stage.type}
          onChange={handleTypeChange}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          {INTERVIEW_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.toLowerCase().replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Outcome
        </label>
        <select
          value={stage.outcome}
          onChange={handleOutcomeChange}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          {INTERVIEW_OUTCOMES.map((outcome) => (
            <option key={outcome} value={outcome}>
              {outcome.toLowerCase().replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-2">
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
          value={stage.duration}
          onChange={handleDurationChange}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Location
        </label>
        <input
          type="text"
          value={stage.location || ''}
          onChange={(e) =>
            onUpdate(stage.id, 'location', e.target.value)
          }
          placeholder="Meeting link or physical location"
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Notes
        </label>
        <textarea
          value={stage.notes || ''}
          onChange={(e) =>
            onUpdate(stage.id, 'notes', e.target.value)
          }
          rows={2}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(stage.id)}
        className="col-span-2 flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
      >
        <MinusIcon className="h-4 w-4 mr-1" />
        Remove Interview
      </button>
    </div>
  );
}
