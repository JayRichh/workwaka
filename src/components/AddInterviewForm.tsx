// src/components/AddInterviewForm.tsx
"use client"

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Form } from './ui/form';
import { InterviewStage, InterviewType, JobApplication } from '../types';
import { JobLookup } from './JobLookup';
import { InterviewDetailsForm } from './form/InterviewDetailsForm';

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Job Selection Section */}
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

        {/* Interview Details Section */}
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
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Interview
          </button>
        </div>
      </form>
    </Form>
  );
}
