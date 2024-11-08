// src/components/AddEventForm.tsx

"use client"

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from './ui/form';
import { CalendarEvent } from '../types';
import { addMinutes } from 'date-fns';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface AddEventFormProps {
  onSubmit: (eventData: Partial<CalendarEvent>) => void;
  onCancel: () => void;
  initialDate: Date | null;
}

type FormValues = {
  title: string;
  isAllDay: boolean;
  startDate: Date | null;
  endDate: Date | null;
  description: string;
  location: string;
};

export function AddEventForm({
  onSubmit,
  onCancel,
  initialDate,
}: AddEventFormProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      title: '',
      isAllDay: false,
      startDate: initialDate || new Date(),
      endDate: addMinutes(initialDate || new Date(), 60),
      description: '',
      location: '',
    },
    mode: 'onChange',
  });

  const handleSubmit: SubmitHandler<FormValues> = (data) => {
    const { title, isAllDay, startDate, endDate, description, location } = data;
    if (!startDate) return;
    onSubmit({
      title,
      isAllDay,
      startDate: startDate.toISOString(),
      endDate: isAllDay ? startDate.toISOString() : endDate?.toISOString(),
      description,
      location,
      type: 'DEADLINE',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Title and All Day Checkbox */}
        <div className="flex items-start space-x-4">
          <div className="flex-grow">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">Title</FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      required
                      {...field}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      placeholder="Event Title"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                </FormItem>
              )}
            />
          </div>
          <div className="pt-7">
            <FormField
              control={form.control}
              name="isAllDay"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormControl>
                    <input
                      id="isAllDay"
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                  </FormControl>
                  <FormLabel htmlFor="isAllDay" className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                    All Day Event
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Date/Time Section */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Start Date {form.watch('isAllDay') ? '' : '& Time'}
                </FormLabel>
                <FormControl>
                  <ReactDatePicker
                    selected={field.value}
                    onChange={(date: Date | null) => field.onChange(date)}
                    showTimeSelect={!form.watch('isAllDay')}
                    timeIntervals={15}
                    dateFormat={form.watch('isAllDay') ? 'P' : 'Pp'}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </FormControl>
                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
              </FormItem>
            )}
          />

          {!form.watch('isAllDay') && (
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">End Date & Time</FormLabel>
                  <FormControl>
                    <ReactDatePicker
                      selected={field.value}
                      onChange={(date: Date | null) => field.onChange(date)}
                      showTimeSelect
                      timeIntervals={15}
                      dateFormat="Pp"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      minDate={form.watch('startDate') || undefined}
                      minTime={form.watch('startDate') || undefined}
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Location and Description Section */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">Location</FormLabel>
                <FormControl>
                  <input
                    type="text"
                    {...field}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="Event Location"
                  />
                </FormControl>
                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">Description</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="Event Description"
                  />
                </FormControl>
                <FormMessage className="text-red-600 dark:text-red-400 text-sm" />
              </FormItem>
            )}
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
            disabled={!form.formState.isValid || !form.watch('startDate')}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !form.formState.isValid || !form.watch('startDate') ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Add Event
          </button>
        </div>
      </form>
    </Form>
  );
}
