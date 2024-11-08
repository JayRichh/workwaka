// src/components/AddInterviewForm.tsx
"use client"

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Form } from './ui/form';
import { InterviewStage, InterviewType, JobApplication } from '../types';
import { JobLookup } from './JobLookup';
import { InterviewDetailsForm } from './form/InterviewDetailsForm';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { formatISO, addMinutes } from 'date-fns';

interface AddInterviewFormProps {
  onSubmit: (
    job: JobApplication,
    interviewData: Partial<InterviewStage>
  ) => void;
  onCancel: () => void;
  initialDate: Date | null;
}

type FormValues = {
  type: InterviewType;
  scheduledDate: Date | null;
  duration: number;
  isRemote: boolean;
  location: string;
  notes: string;
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

export function AddInterviewForm({
  onSubmit,
  onCancel,
  initialDate,
}: AddInterviewFormProps) {
  const [selectedJob, setSelectedJob] = React.useState<JobApplication | null>(null);
  const [showJobValidation, setShowJobValidation] = React.useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      type: 'PHONE_SCREEN',
      scheduledDate: initialDate || new Date(),
      duration: 60,
      isRemote: true,
      location: '',
      notes: '',
    },
    mode: 'onChange',
  });

  const createCalendarUrl = (data: FormValues, job: JobApplication) => {
    if (!data.scheduledDate) return '';

    const startDate = formatISO(data.scheduledDate).replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = formatISO(addMinutes(data.scheduledDate, data.duration)).replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const title = encodeURIComponent(`${data.type.replace(/_/g, ' ')} Interview - ${job.companyName}`);
    const description = encodeURIComponent(
      `Job Title: ${job.jobTitle}\n` +
      `Company: ${job.companyName}\n` +
      `Type: ${data.type.replace(/_/g, ' ')}\n` +
      `Remote: ${data.isRemote ? 'Yes' : 'No'}\n\n` +
      `Notes:\n${data.notes || 'No notes provided'}`
    );
    const location = encodeURIComponent(data.location || (data.isRemote ? 'Remote Interview' : ''));

    return `webcal://calendar.google.com/calendar/event?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${description}&location=${location}&sprop=&sprop=name:`;
  };

  const openInDefaultCalendar = () => {
    const data = form.getValues();
    if (selectedJob) {
      const url = createCalendarUrl(data, selectedJob);
      if (url) {
        window.open(url, '_blank');
      }
    }
  };

  const handleSubmit: SubmitHandler<FormValues> = (data) => {
    if (!selectedJob) {
      setShowJobValidation(true);
      return;
    }
    if (!data.scheduledDate) return;
    
    onSubmit(selectedJob, {
      type: data.type,
      scheduledDate: data.scheduledDate.toISOString(),
      duration: data.duration,
      isRemote: data.isRemote,
      location: data.location,
      notes: data.notes,
    });
  };

  const handleInputChange = (name: string, value: any) => {
    form.setValue(name as any, value);
  };

  const handleJobSelect = (job: JobApplication | null) => {
    setSelectedJob(job);
    setShowJobValidation(false);
  };

  const isFormValid = form.formState.isValid && form.watch('scheduledDate') && selectedJob;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-6">
          <SectionHeader title="Select Job" />
          <FormSection>
            <div className="w-full space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Job Application <span className="text-red-500">*</span>
                </label>
                {showJobValidation && !selectedJob && (
                  <span className="text-sm text-red-500">
                    Please select a job application
                  </span>
                )}
              </div>
              <div className={`relative ${showJobValidation && !selectedJob ? 'ring-2 ring-red-500 rounded-md' : ''}`}>
                <JobLookup
                  onSelect={handleJobSelect}
                  selectedJob={selectedJob}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Search and select the job application for this interview
              </p>
            </div>
          </FormSection>
        </div>

        <div className="space-y-6">
          <SectionHeader title="Interview Details" />
          <FormSection>
            <InterviewDetailsForm
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
            Add Interview
          </button>
        </div>
      </form>
    </Form>
  );
}
