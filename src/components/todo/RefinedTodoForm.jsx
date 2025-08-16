import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, Tag, BookOpen, Target, FileText } from 'lucide-react';

const RefinedTodoForm = ({ onTodoCreated, onClose }) => {
  const { theme, currentTheme } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    subject: '',
    priority: 'medium',
    difficulty: 3,
    deadline: '',
    dueTime: '',
    estimatedTime: 60,
    tags: [],
    isRecurring: false,
    recurringPattern: 'daily',
    location: '',
    attachments: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTag, setCurrentTag] = useState('');

  const categories = [
    { value: 'personal', label: 'Personal', icon: '👤', color: 'blue' },
    { value: 'work', label: 'Work', icon: '💼', color: 'gray' },
    { value: 'study', label: 'Study', icon: '📚', color: 'green' },
    { value: 'health', label: 'Health', icon: '🏥', color: 'red' },
    { value: 'finance', label: 'Finance', icon: '💰', color: 'yellow' },
    { value: 'social', label: 'Social', icon: '👥', color: 'pink' },
    { value: 'hobby', label: 'Hobby', icon: '🎨', color: 'purple' },
    { value: 'travel', label: 'Travel', icon: '✈️', color: 'cyan' },
    { value: 'shopping', label: 'Shopping', icon: '🛒', color: 'orange' },
    { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: 'emerald' },
    { value: 'career', label: 'Career', icon: '🚀', color: 'indigo' },
    { value: 'learning', label: 'Learning', icon: '🧠', color: 'violet' },
    { value: 'exercise', label: 'Exercise', icon: '💪', color: 'lime' },
    { value: 'reading', label: 'Reading', icon: '📖', color: 'amber' },
    { value: 'coding', label: 'Coding', icon: '💻', color: 'slate' },
    { value: 'design', label: 'Design', icon: '🎨', color: 'rose' },
    { value: 'writing', label: 'Writing', icon: '✍️', color: 'teal' },
    { value: 'other', label: 'Other', icon: '📝', color: 'neutral' }
  ];

  const subjects = [
    'Math', 'Physics', 'Chemistry', 'Biology', 'Literature', 'History',
    'Geography', 'Programming', 'English', 'Art', 'Music', 'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'green', emoji: '🟢' },
    { value: 'medium', label: 'Medium', color: 'yellow', emoji: '🟡' },
    { value: 'high', label: 'High', color: 'orange', emoji: '🟠' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const todoData = {
        ...formData,
        creationMethod: 'manual',
        deadline: formData.deadline && formData.dueTime
          ? new Date(`${formData.deadline}T${formData.dueTime}`)
          : formData.deadline
            ? new Date(formData.deadline)
            : null
      };

      const response = await fetch('/api/todo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(todoData)
      });

      if (response.ok) {
        const newTodo = await response.json();
        onTodoCreated(newTodo);
        if (onClose) onClose();
      } else {
        throw new Error('Failed to create todo');
      }
    } catch (error) {
      console.error('Error creating todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-100 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Create New Task</h3>
                <p className="text-xs text-blue-700 dark:text-blue-300">Add a new task to your list</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title - Compact */}
          <div>
            <label className="block text-xs font-medium text-blue-900 dark:text-blue-100 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="What do you need to do?"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              required
            />
          </div>

          {/* Description - Compact */}
          <div>
            <label className="block text-xs font-medium text-blue-900 dark:text-blue-100 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add more details about this task..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
            />
          </div>

          {/* Category - Compact Grid */}
          <div>
            <label className="block text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.slice(0, 8).map(category => (
                <motion.button
                  key={category.value}
                  type="button"
                  onClick={() => handleInputChange('category', category.value)}
                  className={`p-2 rounded-lg border transition-all duration-200 flex flex-col items-center space-y-1 ${
                    formData.category === category.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm">{category.icon}</span>
                  <span className="text-xs font-medium">{category.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Subject and Priority - Compact Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-blue-900 dark:text-blue-100 mb-1.5">
                Subject
              </label>
              <select
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Select subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-1">
                {priorities.map(priority => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => handleInputChange('priority', priority.value)}
                    className={`p-2 text-xs rounded-lg border transition-all duration-200 ${
                      formData.priority === priority.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {priority.emoji} {priority.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Deadline and Time - Compact Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Calendar className="inline w-3 h-3 mr-1" />
                Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Clock className="inline w-3 h-3 mr-1" />
                Due Time
              </label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => handleInputChange('dueTime', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Tags - Compact */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Tag className="inline w-3 h-3 mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex gap-3 pt-2">
            {onClose && (
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Cancel
              </motion.button>
            )}
            <motion.button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                'Create Task'
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefinedTodoForm; 