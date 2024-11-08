import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { InterviewType } from '../../types';
import ReactDatePicker from 'react-datepicker';
import { setHours, setMinutes } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

interface InterviewDetailsFormProps {
  formData: {
    type: InterviewType;
    scheduledDate: Date | null;
    duration: number;
    isRemote: boolean;
    location: string;
    notes: string;
  };
  onUpdate: (name: string, value: any) => void;
  form: any;
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

export function InterviewDetailsForm({ formData, onUpdate, form }: InterviewDetailsFormProps) {
  // Set time range from 7 AM to 10 PM
  const minTime = setHours(setMinutes(new Date(), 0), 7);
  const maxTime = setHours(setMinutes(new Date(), 0), 22);

  return (
    <div className="space-y-4">
      {/* Interview Type and Schedule */}
      <div className="grid grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interview Type
              </FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  required
                >
                  {INTERVIEW_TYPES.map((interviewType) => (
                    <option key={interviewType} value={interviewType}>
                      {interviewType.toLowerCase().replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduledDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Scheduled Date & Time
              </FormLabel>
              <FormControl>
                <ReactDatePicker
                  selected={field.value}
                  onChange={(date: Date | null) => field.onChange(date)}
                  showTimeSelect
                  timeIntervals={15}
                  minTime={minTime}
                  maxTime={maxTime}
                  dateFormat="MMM d, yyyy h:mm aa"
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Duration and Remote Toggle */}
      <div className="grid grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </FormLabel>
              <FormControl>
                <input
                  type="number"
                  min={15}
                  max={480}
                  step={15}
                  {...field}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isRemote"
          render={({ field }) => (
            <FormItem className="flex items-center pt-8">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </FormControl>
              <FormLabel className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Remote Interview
              </FormLabel>
            </FormItem>
          )}
        />
      </div>

      {/* Location and Notes */}
      <div className="space-y-4">
        {!form.watch('isRemote') && (
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </FormLabel>
                <FormControl>
                  <input
                    type="text"
                    {...field}
                    className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="Interview Location"
                    required={!form.watch('isRemote')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                  placeholder="Additional notes about the interview"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
