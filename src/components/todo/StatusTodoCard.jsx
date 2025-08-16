import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import TimeTracker from './TimeTracker';
import { 
  Clock, Calendar, Tag, MapPin, Edit3, Trash2, 
  Play, Pause, CheckCircle, XCircle, RotateCcw,
  Eye, AlertCircle, Star, CheckSquare, Square,
  Timer
} from 'lucide-react';

const StatusTodoCard = ({ todo, onUpdate, onDelete, onEdit, isSelected, onToggleSelection, onStartPomodoro }) => {
  const { currentTheme } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTimeTracker, setShowTimeTracker] = useState(false);

  // Updated status configuration with only 4 statuses
  const statusConfig = {
    pending: {
      label: 'Pending',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-300',
      icon: <AlertCircle className="w-4 h-4" />,
      nextStates: ['done', 'cancelled']
    },
    done: {
      label: 'Done',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-300',
      icon: <CheckCircle className="w-4 h-4" />,
      nextStates: ['pending', 'cancelled']
    },
    cancelled: {
      label: 'Cancelled',
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
      icon: <XCircle className="w-4 h-4" />,
      nextStates: ['pending']
    },
    overdue: {
      label: 'Overdue',
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-300',
      icon: <Clock className="w-4 h-4" />,
      nextStates: ['done', 'cancelled']
    }
  };

  const priorityConfig = {
    low: { color: 'green', emoji: '🟢', label: 'Low' },
    medium: { color: 'yellow', emoji: '🟡', label: 'Medium' },
    high: { color: 'orange', emoji: '🟠', label: 'High' }
  };

  const categoryIcons = {
    personal: '👤', work: '💼', study: '📚', health: '🏥',
    finance: '💰', social: '👥', hobby: '🎨', travel: '✈️',
    shopping: '🛒', family: '👨‍👩‍👧‍👦', career: '🚀', learning: '🧠',
    exercise: '💪', reading: '📖', coding: '💻', design: '🎨',
    writing: '✍️', other: '📝'
  };

  // Check if todo is overdue
  const isOverdue = () => {
    if (!todo.dueDate && !todo.deadline) return false;
    const dueDate = todo.dueDate || todo.deadline;
    return new Date(dueDate) < new Date() && todo.status !== 'done' && todo.status !== 'cancelled';
  };

  // Get current status (consider overdue)
  const getCurrentStatus = () => {
    if (isOverdue()) return 'overdue';
    return todo.status || 'pending';
  };

  const currentStatus = getCurrentStatus();

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/todo/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        onUpdate(data.todo);
      }
    } catch (error) {
      console.error('Error updating todo status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getProgressPercentage = () => {
    if (currentStatus === 'done') return 100;
    if (currentStatus === 'cancelled') return 0;
    if (currentStatus === 'overdue') return 25;
    return 0; // pending
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const getStatusButtons = () => {
    const config = statusConfig[currentStatus];
    if (!config) return null;

    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {config.nextStates.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={isUpdating}
            className={`px-2.5 py-1 text-xs rounded-lg transition-all duration-200 font-semibold shadow-sm hover:shadow-md ${
              status === 'done' 
                ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-105' 
                : status === 'cancelled'
                ? 'bg-red-500 text-white hover:bg-red-600 hover:scale-105'
                : status === 'overdue'
                ? 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105'
                : 'bg-gray-500 text-white hover:bg-gray-600 hover:scale-105'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {status === 'done' && <CheckCircle className="w-3 h-3 inline mr-1" strokeWidth={2.5} />}
            {status === 'cancelled' && <XCircle className="w-3 h-3 inline mr-1" strokeWidth={2.5} />}
            {status === 'overdue' && <Clock className="w-3 h-3 inline mr-1" strokeWidth={2.5} />}
            {status === 'pending' && <AlertCircle className="w-3 h-3 inline mr-1" strokeWidth={2.5} />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative bg-white rounded-xl shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
        isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : statusConfig[currentStatus]?.borderColor || 'border-gray-200'
      }`}
    >
      {/* Selection Checkbox */}
      {onToggleSelection && (
        <div className="absolute top-2 left-2">
          <button
            onClick={() => onToggleSelection(todo.id)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
            ) : (
              <Square className="w-4 h-4 text-gray-500" strokeWidth={2.5} />
            )}
          </button>
        </div>
      )}

      <div className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base mb-1 pr-8 leading-tight">
              {todo.title}
            </h3>
            {todo.description && (
              <p className="text-gray-600 text-xs mb-2 line-clamp-2 font-medium">
                {todo.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 mb-2">
          <button
            onClick={() => onEdit(todo)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit Todo"
          >
            <Edit3 className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete Todo"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
          {/* Pomodoro Button */}
          <button
            onClick={() => onStartPomodoro && onStartPomodoro(todo)}
            className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
            title="Start Pomodoro Timer"
          >
            <Timer className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Status and Priority */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
            statusConfig[currentStatus]?.bgColor || 'bg-gray-100'
          } ${
            statusConfig[currentStatus]?.textColor || 'text-gray-700'
          }`}>
            {React.cloneElement(statusConfig[currentStatus]?.icon, { className: "w-3 h-3", strokeWidth: 2.5 })}
            {statusConfig[currentStatus]?.label}
          </span>
          
          {/* Group Todo Indicator */}
          {todo.todoType === 'group' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              👥 Group
              {todo.group && (
                <span className="ml-1 text-purple-600">• {todo.group.name}</span>
              )}
            </span>
          )}
          
          {todo.priority && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
              priorityConfig[todo.priority]?.color === 'green' ? 'bg-green-100 text-green-800' :
              priorityConfig[todo.priority]?.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {priorityConfig[todo.priority]?.emoji}
              {priorityConfig[todo.priority]?.label}
            </span>
          )}
          
          {todo.category && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {categoryIcons[todo.category] || '📝'}
              {todo.category.charAt(0).toUpperCase() + todo.category.slice(1)}
            </span>
          )}
        </div>

        {/* Due Date and Time */}
        {(todo.dueDate || todo.deadline) && (
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-2 font-semibold">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" strokeWidth={2.5} />
              {formatDate(todo.dueDate || todo.deadline)}
            </span>
            {todo.estimatedTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
                {todo.estimatedTime}
              </span>
            )}
          </div>
        )}

        {/* Pomodoro Info */}
        {todo.pomodoro_sessions && todo.pomodoro_sessions.length > 0 && (
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-2 font-semibold">
            <span className="flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" strokeWidth={2.5} />
              {todo.pomodoro_sessions.length} sessions
              {todo.total_pomodoro_time && (
                <span className="ml-1">
                  • {Math.round(todo.total_pomodoro_time / 60)}m
                </span>
              )}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1 font-semibold">
            <span>Progress</span>
            <span>{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentStatus === 'done' ? 'bg-green-500' :
                currentStatus === 'overdue' ? 'bg-orange-500' :
                currentStatus === 'cancelled' ? 'bg-red-500' :
                'bg-gray-400'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Status Change Buttons */}
        {getStatusButtons()}

        {/* Tags */}
        {todo.tags && Array.isArray(todo.tags) && todo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {todo.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                {tag}
              </span>
            ))}
            {todo.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                +{todo.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatusTodoCard;
