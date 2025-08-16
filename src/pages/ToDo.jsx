import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSearchParams } from 'react-router-dom';
import LoadingSpinner, { SkeletonLoader } from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import TodoCreationHub from '../components/todo/TodoCreationHub';
import StatusTodoCard from '../components/todo/StatusTodoCard';
import AssignmentSubmission from '../components/todo/AssignmentSubmission';
import TodoExportImport from '../components/todo/TodoExportImport';
import GroupTodoIntegration from '../components/todo/GroupTodoIntegration';
import TestGroupTodo from '../components/todo/TestGroupTodo';
import SmartAnalyticsDashboard from '../components/todo/SmartAnalyticsDashboard';
import PomodoroTimer from '../components/todo/PomodoroTimer';
import AdvancedGroupTodoSystem from '../components/todo/AdvancedGroupTodoSystem';
import { Plus, Filter, Search, BarChart3, Calendar, Grid, List, CheckCircle, Clock, Edit, AlertCircle, CheckSquare, Square, Timer, Target, TrendingUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const ToDo = () => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [editingTodo, setEditingTodo] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });
  const [analytics, setAnalytics] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    completionRate: 0
  });
  const [activeTab, setActiveTab] = useState('todos');
  const [selectedTodos, setSelectedTodos] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [activePomodoroTodo, setActivePomodoroTodo] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    calculateAnalytics();
  }, [todos]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  // Handle query parameters for automatic tab switching
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const groupIdParam = searchParams.get('groupId');
    
    if (tabParam === 'group-todos') {
      setActiveTab('group-todos');
      
      // If there's a groupId, you can use it to filter or highlight specific group
      if (groupIdParam) {
        console.log('Switching to group todos for group:', groupIdParam);
        // You can add logic here to filter todos for specific group
      }
    }
  }, [searchParams]);

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/todo/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        // Show both personal and group todos in the main todos tab
        setTodos(data.todos || []);
        console.log('📋 Personal todos loaded:', data.personalTodos?.length || 0);
        console.log('📋 Group todos loaded:', data.groupTodos?.length || 0);
        console.log('📋 Total todos loaded:', data.todos?.length || 0);
      } else {
        console.error('Failed to fetch todos:', data.message);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast.error('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.status === 'done' || todo.status === 'completed').length;
    const pending = todos.filter(todo => todo.status === 'pending').length;
    const inProgress = todos.filter(todo => todo.status === 'in_progress').length;
    const overdue = todos.filter(todo => 
      todo.deadline && new Date(todo.deadline) < new Date() && 
      todo.status !== 'done' && todo.status !== 'completed' && todo.status !== 'cancelled'
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    setAnalytics({
      total,
      completed,
      pending,
      inProgress,
      overdue,
      completionRate
    });
  };

  const handleTodoCreated = (newTodo) => {
    setTodos(prev => [...prev, newTodo]);
    setShowCreateModal(false);
    toast.success('Todo created successfully!');
  };

  const handleTodoUpdate = async (id, updates) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`/api/todo/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(prev => prev.map(todo => 
          todo.id === id ? { ...todo, ...updatedTodo } : todo
        ));
        toast.success('Todo updated successfully!');
      } else {
        throw new Error('Failed to update todo');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error('Failed to update todo');
    }
  };

  const handleTodoEdit = (todo) => {
    setEditingTodo(todo);
    setEditForm({
      title: todo.title || '',
      description: todo.description || '',
      dueDate: todo.deadline ? todo.deadline.split('T')[0] : '',
      priority: todo.priority || 'medium'
    });
  };

  const handleUpdateTodo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`/api/todo/${editingTodo.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          deadline: editForm.dueDate,
          priority: editForm.priority
        })
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(prev => prev.map(todo => 
          todo.id === editingTodo.id ? { ...todo, ...updatedTodo } : todo
        ));
        setEditingTodo(null);
        setEditForm({ title: '', description: '', dueDate: '', priority: 'medium' });
        toast.success('Todo updated successfully!');
      } else {
        throw new Error('Failed to update todo');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error('Failed to update todo');
    }
  };

  const deleteTodo = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`/api/todo/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
      const data = await response.json();
      if (data.success) {
        setTodos(todos.filter(todo => todo.id !== id));
        toast.success('Todo deleted successfully!');
        }
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete todo');
    }
  };

  // Bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedTodos.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const promises = selectedTodos.map(id => {
        const url = bulkAction === 'delete' 
          ? `/api/todo/${id}`
          : `/api/todo/${id}`;
        
        const method = bulkAction === 'delete' ? 'DELETE' : 'PUT';
        const body = bulkAction === 'delete' ? null : JSON.stringify({ status: bulkAction });

        return fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          ...(body && { body })
        });
      });

      await Promise.all(promises);
      
      // Refresh todos
      fetchTodos();
      setSelectedTodos([]);
      setBulkAction('');
      
      const actionText = bulkAction === 'delete' ? 'deleted' : `marked as ${bulkAction}`;
      toast.success(`${selectedTodos.length} todos ${actionText} successfully!`);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const toggleTodoSelection = (id) => {
    setSelectedTodos(prev => 
      prev.includes(id) 
        ? prev.filter(todoId => todoId !== id)
        : [...prev, id]
    );
  };

  const selectAllTodos = () => {
    if (selectedTodos.length === filteredTodos.length) {
      setSelectedTodos([]);
    } else {
      setSelectedTodos(filteredTodos.map(todo => todo.id));
    }
  };

  const handleImportTodos = async (importData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const promises = importData.map(todoData => 
        fetch('/api/todo/all', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(todoData)
        })
      );

      await Promise.all(promises);
      fetchTodos();
      toast.success(`${importData.length} todos imported successfully!`);
    } catch (error) {
      console.error('Error importing todos:', error);
      toast.error('Failed to import todos');
    }
  };

  const filteredTodos = todos.filter(todo => {
    const matchesFilter = filter === 'all' ||
      (filter === 'pending' && todo.status === 'pending') ||
      (filter === 'in_progress' && todo.status === 'in_progress') ||
      (filter === 'done' && todo.status === 'done') ||
      (filter === 'completed' && todo.status === 'completed') ||
      (filter === 'cancelled' && todo.status === 'cancelled') ||
      (filter === 'overdue' && todo.deadline && new Date(todo.deadline) < new Date() && 
       todo.status !== 'done' && todo.status !== 'completed' && todo.status !== 'cancelled');

    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (todo.category && todo.category.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const typeIcons = {
    personal: '👤',
    group: '👥',
    assignment: '📚'
  };

  const handleStartPomodoro = (todo) => {
    setActivePomodoroTodo(todo);
    setShowPomodoro(true);
  };

  const handlePomodoroComplete = async (sessionData) => {
    try {
      // Update todo with pomodoro session data
      if (activePomodoroTodo) {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/todo/${activePomodoroTodo.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pomodoro_sessions: [
              ...(activePomodoroTodo.pomodoro_sessions || []),
              sessionData
            ],
            total_pomodoro_time: (activePomodoroTodo.total_pomodoro_time || 0) + sessionData.duration
          })
        });

        if (response.ok) {
          // Refresh todos to show updated data
          fetchTodos();
          toast.success('Pomodoro session completed!');
        }
      }
      
      setShowPomodoro(false);
      setActivePomodoroTodo(null);
    } catch (error) {
      console.error('Error updating pomodoro session:', error);
      toast.error('Failed to update pomodoro session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner type="ring" size="xlarge" text="Loading Todos..." />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      currentTheme === 'neon'
        ? 'bg-gray-900'
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Enhanced Header with Better Spacing */}
      <div className={`${
        currentTheme === 'neon' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-b sticky top-0 z-40 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Header Content */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 mt-20">
                <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                <h1 className={`text-3xl font-black ${
                currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                } tracking-tight`}>
                Todo Management
              </h1>
              </div>
              <p className={`text-base ${
                currentTheme === 'neon' ? 'text-gray-300' : 'text-gray-600'
              } ml-4`}>
                Manage your tasks with enhanced status tracking and AI-powered insights
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Tab Navigation - Improved Design */}
              <div className="flex bg-gray-100 rounded-xl p-1.5 shadow-inner">
                <button
                  onClick={() => setActiveTab('todos')}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'todos'
                      ? 'bg-white text-gray-900 shadow-md transform scale-105 border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  My Todos
                </button>
                <button
                  onClick={() => setActiveTab('group-todos')}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'group-todos'
                      ? 'bg-white text-gray-900 shadow-md transform scale-105 border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Group Todos
                </button>
                <button
                  onClick={() => setActiveTab('smart-analytics')}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'smart-analytics'
                      ? 'bg-white text-gray-900 shadow-md transform scale-105 border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Smart Analytics
                </button>
                {user?.role === 'student' && (
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      activeTab === 'assignments'
                        ? 'bg-white text-gray-900 shadow-md transform scale-105 border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Assignments
                  </button>
                )}
              </div>

                  {/* Action Buttons - Enhanced Design */}
                  {activeTab === 'todos' && (
                    <div className="flex items-center gap-3">
                      <TodoExportImport todos={todos} onImport={handleImportTodos} />
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-gray-700"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Task</span>
                      </button>
                      
                      <button
                        onClick={() => setShowPomodoro(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-gray-700"
                      >
                        <Timer className="w-4 h-4" />
                        <span>Pomodoro Timer</span>
                      </button>
                    </div>
                  )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Improved Spacing */}
      <div className="max-w-7xl mx-auto px-6 py-8 mt-32">
        {activeTab === 'todos' ? (
          <>
            {/* Enhanced Analytics Dashboard - Refined Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
              <motion.div
                className={`p-2 rounded-lg ${
                  currentTheme === 'neon' 
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-500' 
                    : 'bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-400'
                } shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-102`}
                whileHover={{ y: -1 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-6 h-6 rounded-md bg-green-400 flex items-center justify-center ${
                    currentTheme === 'neon' ? 'bg-gray-700' : 'bg-green-400'
                  }`}>
                    <BarChart3 className={`w-3 h-3 ${
                      currentTheme === 'neon' ? 'text-gray-300' : 'text-black'
                    }`} />
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${
                      currentTheme === 'neon' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Total Tasks
                    </p>
                    <p className={`text-lg font-black ${
                      currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {todos.length}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className={`p-2 rounded-lg ${
                  currentTheme === 'neon' 
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-500' 
                    : 'bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-400'
                } shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-102`}
                whileHover={{ y: -1 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-6 h-6 rounded-md bg-green-400 flex items-center justify-center ${
                    currentTheme === 'neon' ? 'bg-gray-700' : 'bg-green-400'
                  }`}>
                    <CheckCircle className={`w-3 h-3 ${
                      currentTheme === 'neon' ? 'text-gray-300' : 'text-black'
                    }`} />
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${
                      currentTheme === 'neon' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Completed
                    </p>
                    <p className={`text-lg font-black ${
                      currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {todos.filter(todo => todo.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className={`p-2 rounded-lg ${
                  currentTheme === 'neon' 
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-500' 
                    : 'bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-400'
                } shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-102`}
                whileHover={{ y: -1 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-6 h-6 rounded-md bg-green-400 flex items-center justify-center ${
                    currentTheme === 'neon' ? 'bg-gray-700' : 'bg-green-400'
                  }`}>
                    <Clock className={`w-3 h-3 ${
                      currentTheme === 'neon' ? 'text-gray-300' : 'text-black'
                    }`} />
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${
                      currentTheme === 'neon' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Pending
                    </p>
                    <p className={`text-lg font-black ${
                      currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {todos.filter(todo => todo.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className={`p-2 rounded-lg ${
                  currentTheme === 'neon' 
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-500' 
                    : 'bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-400'
                } shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-102`}
                whileHover={{ y: -1 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-6 h-6 rounded-md bg-green-400 flex items-center justify-center ${
                    currentTheme === 'neon' ? 'bg-gray-700' : 'bg-green-400'
                  }`}>
                    <AlertCircle className={`w-3 h-3 ${
                      currentTheme === 'neon' ? 'text-gray-300' : 'text-black'
                    }`} />
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${
                      currentTheme === 'neon' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Overdue
                    </p>
                    <p className={`text-lg font-black ${
                      currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {todos.filter(todo => {
                        if (todo.dueDate && todo.status !== 'completed') {
                          return new Date(todo.dueDate) < new Date();
                        }
                        return false;
                      }).length}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className={`p-2 rounded-lg ${
                  currentTheme === 'neon' 
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-500' 
                    : 'bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-400'
                } shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-102`}
                whileHover={{ y: -1 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-6 h-6 rounded-md bg-green-400 flex items-center justify-center ${
                    currentTheme === 'neon' ? 'bg-gray-700' : 'bg-green-400'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${
                      currentTheme === 'neon' ? 'text-gray-300' : 'text-black'
                    }`} />
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${
                      currentTheme === 'neon' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Completion Rate
                    </p>
                    <p className={`text-lg font-black ${
                      currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {todos.length > 0 
                        ? Math.round((todos.filter(todo => todo.status === 'completed').length / todos.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Search and Filter Controls - Refined Professional Design */}
            <div className={`mb-6 p-4 rounded-lg ${
              currentTheme === 'neon' 
                ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-500' 
                : 'bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-400'
            } shadow-sm transition-all duration-300`}>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                {/* Enhanced Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    currentTheme === 'neon' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search tasks by title, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border ${
                      currentTheme === 'neon'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:ring-1 focus:ring-gray-500'
                    } transition-all duration-200 focus:outline-none`}
                  />
                </div>

                {/* Enhanced Filter Dropdown */}
                <div className="relative filter-dropdown">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className={`px-3 py-2 text-sm rounded-lg border flex items-center justify-between w-full ${
                      currentTheme === 'neon'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } transition-all duration-200 focus:outline-none`}
                  >
                    <span>{filter === 'all' ? 'All Tasks' : filter === 'pending' ? 'Pending' : filter === 'done' ? 'Done' : filter === 'overdue' ? 'Overdue' : filter === 'cancelled' ? 'Cancelled' : 'All Tasks'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showFilterDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                      {[
                        { value: 'all', label: 'All Tasks' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'done', label: 'Done' },
                        { value: 'overdue', label: 'Overdue' },
                        { value: 'cancelled', label: 'Cancelled' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFilter(option.value);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                            filter === option.value
                              ? 'bg-black text-white'
                              : 'text-gray-900 hover:bg-gray-100'
                          } first:rounded-t-lg last:rounded-b-lg`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Toggle - Refined Design */}
                <div className={`flex rounded-lg p-1 ${
                  currentTheme === 'neon' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'list'
                        ? currentTheme === 'neon'
                          ? 'bg-gray-600 text-white shadow-md'
                          : 'bg-white text-gray-900 shadow-md'
                        : currentTheme === 'neon'
                          ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'grid'
                        ? currentTheme === 'neon'
                          ? 'bg-gray-600 text-white shadow-md'
                          : 'bg-white text-gray-900 shadow-md'
                        : currentTheme === 'neon'
                          ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Todo List Section */}
            <div className="space-y-6">
              {/* Select All Checkbox - Improved Design */}
              {filteredTodos.length > 0 && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <button
                    onClick={selectAllTodos}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      selectedTodos.length === filteredTodos.length 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {selectedTodos.length === filteredTodos.length ? 
                      <CheckSquare className="w-5 h-5" /> : 
                      <Square className="w-5 h-5" />
                    }
                  </button>
                  <span className={`text-sm font-medium ${
                    currentTheme === 'neon' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {selectedTodos.length === filteredTodos.length ? 'Deselect all' : 'Select all'}
                  </span>
                </div>
              )}

              {/* Todo List/Grid with Enhanced Spacing */}
              <div className={`${
                viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'
              }`}>
              <AnimatePresence>
                {filteredTodos.length === 0 ? (
                  <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100"
                  >
                      <div className="text-8xl mb-6">📝</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">No tasks found</h3>
                      <p className="text-gray-600 text-lg mb-6">Create your first task to get started!</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        <Plus className="w-5 h-5 inline mr-2" />
                        Create First Task
                      </button>
                  </motion.div>
                ) : (
                  filteredTodos.map((todo) => (
                    <StatusTodoCard
                      key={todo.id}
                      todo={todo}
                      onUpdate={handleTodoUpdate}
                      onDelete={deleteTodo}
                      onEdit={handleTodoEdit}
                      isSelected={selectedTodos.includes(todo.id)}
                      onToggleSelection={toggleTodoSelection}
                      onStartPomodoro={handleStartPomodoro}
                    />
                  ))
                )}
              </AnimatePresence>
              </div>
            </div>
          </>
        ) : activeTab === 'group-todos' ? (
          <AdvancedGroupTodoSystem />
        ) : activeTab === 'smart-analytics' ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Smart Analytics</h2>
              <p className="text-gray-600 text-lg">AI-powered insights and recommendations for better productivity</p>
            </div>
            <SmartAnalyticsDashboard />
          </div>
        ) : (
          <AssignmentSubmission />
        )}
      </div>

      {/* Create Todo Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <TodoCreationHub
            isOpen={showCreateModal}
            onTodoCreated={handleTodoCreated}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Edit Todo Modal - Enhanced Design */}
      {editingTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h3 className="text-2xl font-bold text-gray-900">Edit Todo</h3>
            </div>
            <form onSubmit={handleUpdateTodo} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Update Todo
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTodo(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Pomodoro Timer Modal */}
      <AnimatePresence>
        {showPomodoro && activePomodoroTodo && (
          <PomodoroTimer
            isOpen={showPomodoro}
            onClose={() => setShowPomodoro(false)}
            onComplete={handlePomodoroComplete}
            todo={activePomodoroTodo}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToDo;