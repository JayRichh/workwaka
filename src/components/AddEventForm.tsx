// src/components/AddEventForm.tsx
"use client"

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Form } from './ui/form';
import { CalendarEvent } from '../types';
import { addMinutes, formatISO } from 'date-fns';
import { EventDetailsForm } from './form/EventDetailsForm';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

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

  const createCalendarUrl = (data: FormValues) => {
    if (!data.startDate) return '';

    const startDate = formatISO(data.startDate).replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = data.isAllDay 
      ? formatISO(data.startDate).replace(/[-:]/g, '').split('.')[0] + 'Z'
      : data.endDate 
        ? formatISO(data.endDate).replace(/[-:]/g, '').split('.')[0] + 'Z'
        : formatISO(addMinutes(data.startDate, 60)).replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const title = encodeURIComponent(data.title);
    const description = encodeURIComponent(data.description || '');
    const location = encodeURIComponent(data.location || '');

    return `webcal://calendar.google.com/calendar/event?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${description}&location=${location}&sprop=&sprop=name:`;
  };

  const openInDefaultCalendar = () => {
    const data = form.getValues();
    const url = createCalendarUrl(data);
    if (url) {
      window.open(url, '_blank');
    }
  };

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

  const isFormValid = form.formState.isValid && form.watch('startDate') && form.watch('title');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto order-3 sm:order-1 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={openInDefaultCalendar}
            disabled={!isFormValid}
            className="w-full sm:w-auto order-2 sm:order-2 inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            Add to Calendar
          </button>
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full sm:w-auto order-1 sm:order-3 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Event
          </button>
        </div>
      </form>
    </Form>
  );
}
