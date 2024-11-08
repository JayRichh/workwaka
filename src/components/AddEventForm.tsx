// src/components/AddEventForm.tsx
"use client"

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Form } from './ui/form';
import { CalendarEvent } from '../types';
import { addMinutes } from 'date-fns';
import { EventDetailsForm } from './form/EventDetailsForm';

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

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
      {title}
    </h2>
  );
}

function FormSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {children}
    </div>
  );
}

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

  const handleInputChange = (name: string, value: any) => {
    form.setValue(name as any, value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Event Details Section */}
        <div className="space-y-6">
          <SectionHeader title="Event Details" />
          <FormSection>
            <EventDetailsForm
              formData={form.getValues()}
              onUpdate={handleInputChange}
              form={form}
            />
          </FormSection>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!form.formState.isValid || !form.watch('startDate')}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Event
          </button>
        </div>
      </form>
    </Form>
  );
}
