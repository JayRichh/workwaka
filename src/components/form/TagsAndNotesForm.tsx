import { useState } from 'react';
import { JobApplication } from '../../types';

interface TagsAndNotesFormProps {
  formData: JobApplication;
  onUpdate: (name: string, value: any) => void;
  onTagsChange: (tags: string[]) => void;
}

export function TagsAndNotesForm({ formData, onUpdate, onTagsChange }: TagsAndNotesFormProps) {
  const [tagInput, setTagInput] = useState('');

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    if (e.target.value.endsWith(',')) {
      const newTag = e.target.value.slice(0, -1).trim();
      if (newTag && !formData.tags.includes(newTag)) {
        onTagsChange([...formData.tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        onTagsChange([...formData.tags, newTag]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput) {
      e.preventDefault();
      const newTags = [...formData.tags];
      newTags.pop();
      onTagsChange(newTags);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(formData.tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Tags Section */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Tags
        </label>
        <div className="relative">
          <div className="min-h-[38px] p-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400">
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    <span className="sr-only">Remove tag {tag}</span>
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={handleTagsChange}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-[120px] border-0 p-0 bg-transparent text-gray-900 dark:text-gray-100 focus:ring-0 text-sm placeholder-gray-500 dark:placeholder-gray-400"
                placeholder={formData.tags.length === 0 ? "Add tags (press Enter or comma to add)" : ""}
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Press Enter or use comma to add tags. Backspace to remove the last tag.
          </p>
        </div>
      </div>

      {/* Notes Section */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Notes
        </label>
        <div className="relative">
          <textarea
            name="notes"
            rows={4}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={formData.notes || ''}
            onChange={(e) => onUpdate(e.target.name, e.target.value)}
            placeholder="Add any additional notes about the position, company, or application process..."
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
            {formData.notes?.length || 0} characters
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Use this space to keep track of important details, requirements, or follow-up items.
        </p>
      </div>

      {/* Quick Tips */}
      {formData.tags.length === 0 && formData.notes?.length === 0 && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Tips for using tags and notes</h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use tags to categorize jobs (e.g., remote, tech, startup)</li>
                  <li>Add notes about company culture, interview process, or key requirements</li>
                  <li>Keep track of important deadlines or follow-up items</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
