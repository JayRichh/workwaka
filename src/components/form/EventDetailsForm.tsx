import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import ReactDatePicker from 'react-datepicker';
import { setHours, setMinutes } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

interface EventDetailsFormProps {
  formData: {
    title: string;
    isAllDay: boolean;
    startDate: Date | null;
    endDate: Date | null;
    location: string;
    description: string;
  };
  onUpdate: (name: string, value: any) => void;
  form: any;
}

export function EventDetailsForm({ formData, onUpdate, form }: EventDetailsFormProps) {
  // Set time range from 7 AM to 10 PM
  const minTime = setHours(setMinutes(new Date(), 0), 7);
  const maxTime = setHours(setMinutes(new Date(), 0), 22);

  return (
    <div className="space-y-4">
      {/* Title and All Day Toggle */}
      <div className="flex items-start justify-between gap-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Event Title
              </FormLabel>
              <FormControl>
                <input
                  type="text"
                  required
                  {...field}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  placeholder="Enter event title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isAllDay"
          render={({ field }) => (
            <FormItem className="flex items-center pt-6">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </FormControl>
              <FormLabel className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                All Day Event
              </FormLabel>
            </FormItem>
          )}
        />
      </div>

      {/* Date/Time Section */}
      <div className="grid grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start {form.watch('isAllDay') ? 'Date' : 'Date & Time'}
              </FormLabel>
              <FormControl>
                <ReactDatePicker
                  selected={field.value}
                  onChange={(date: Date | null) => field.onChange(date)}
                  showTimeSelect={!form.watch('isAllDay')}
                  timeIntervals={15}
                  minTime={minTime}
                  maxTime={maxTime}
                  dateFormat={form.watch('isAllDay') ? 'MMM d, yyyy' : 'MMM d, yyyy h:mm aa'}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!form.watch('isAllDay') && (
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date & Time
                </FormLabel>
                <FormControl>
                  <ReactDatePicker
                    selected={field.value}
                    onChange={(date: Date | null) => field.onChange(date)}
                    showTimeSelect
                    timeIntervals={15}
                    minTime={form.watch('startDate') || minTime}
                    maxTime={maxTime}
                    dateFormat="MMM d, yyyy h:mm aa"
                    className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    minDate={form.watch('startDate') || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Location and Description */}
      <div className="grid grid-cols-2 gap-6">
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
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  placeholder="Add location"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none"
                  placeholder="Add description"
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
