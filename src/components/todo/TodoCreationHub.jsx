import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import ManualTodoForm from './ManualTodoForm';
import AIChatTodoCreator from './AIChatTodoCreator';
import TeacherAssignmentView from './TeacherAssignmentView';
import { 
  Edit3, 
  Bot, 
  GraduationCap, 
  Sparkles, 
  BarChart3, 
  CheckCircle, 
  Flame,
  Zap,
  Target,
  Lightbulb,
  Rocket,
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  X
} from 'lucide-react';

const TodoCreationHub = ({ isOpen, onTodoCreated, onClose }) => {
  const { theme, currentTheme } = useTheme();
  const [activeMethod, setActiveMethod] = useState('manual');

  // Don't render if not open
  if (!isOpen) return null;

  const creationMethods = [
    {
      id: 'manual',
      name: 'Manual Creation',
      icon: <Edit3 className="w-5 h-5" />,
      description: 'Create tasks manually with detailed options',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      id: 'ai-chat',
      name: 'AI Assistant',
      icon: <Bot className="w-5 h-5" />,
      description: 'Tell AI what you need to do in natural language',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200'
    },
    {
      id: 'teacher',
      name: 'Teacher Assignments',
      icon: <GraduationCap className="w-5 h-5" />,
      description: 'View and accept assignments from teachers',
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      borderColor: 'border-green-200'
    }
  ];

  const renderActiveComponent = () => {
    switch (activeMethod) {
      case 'manual':
        return <ManualTodoForm onTodoCreated={onTodoCreated} onClose={onClose} />;
      case 'ai-chat':
        return <AIChatTodoCreator onTodoCreated={onTodoCreated} onClose={onClose} />;
      case 'teacher':
        return <TeacherAssignmentView onTodoCreated={onTodoCreated} onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${
          currentTheme === 'neon' 
            ? 'bg-gray-900 border border-cyan-500/30' 
            : currentTheme === 'minimal'
              ? 'bg-white border border-gray-200'
              : 'bg-white/95 backdrop-blur-md'
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Header */}
        <div className={`p-6 border-b ${
          currentTheme === 'neon' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl ${
                currentTheme === 'neon' 
                  ? 'bg-blue-600 shadow-lg shadow-blue-500/25' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-md'
              }`}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${
                  currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                }`}>
                  Create New Task
                </h2>
                <p className={`mt-1 text-lg font-medium ${
                  currentTheme === 'neon' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Choose how you'd like to create your task
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-3 rounded-full transition-all duration-300 ${
                currentTheme === 'neon' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Enhanced Method Selector */}
          <div className={`w-80 p-6 border-r ${
            currentTheme === 'neon' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2 mb-6">
              <Lightbulb className={`w-5 h-5 ${
                currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
              }`} />
              <h3 className={`text-xl font-bold ${
                currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
              }`}>
                Creation Methods
              </h3>
            </div>
            
            <div className="space-y-4">
              {creationMethods.map((method) => (
                <motion.button
                  key={method.id}
                  onClick={() => setActiveMethod(method.id)}
                  className={`w-full p-5 rounded-xl text-left transition-all duration-300 ${
                    activeMethod === method.id
                      ? currentTheme === 'neon'
                        ? 'bg-gray-600/20 border-2 border-gray-500 shadow-lg'
                        : 'bg-gray-100 border-2 border-gray-300 shadow-md'
                      : currentTheme === 'neon'
                        ? 'bg-gray-700 border-2 border-gray-600 hover:border-gray-500 hover:bg-gray-700/70'
                        : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${
                      activeMethod === method.id
                        ? currentTheme === 'neon'
                          ? 'bg-white text-gray-900 shadow-lg'
                          : 'bg-gray-900 text-white shadow-md'
                        : currentTheme === 'neon'
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                    }`}>
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-lg font-bold ${
                        currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {method.name}
                      </h4>
                      <p className={`text-sm mt-2 leading-relaxed ${
                        currentTheme === 'neon' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {method.description}
                      </p>
                    </div>
                  </div>
                  
                  {activeMethod === method.id && (
                    <motion.div
                      className={`mt-4 p-3 rounded-lg ${
                        currentTheme === 'neon' 
                          ? 'bg-white text-gray-900' 
                          : 'bg-gray-900 text-white'
                      } text-sm font-semibold text-center flex items-center justify-center space-x-2`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Active</span>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Enhanced Quick Stats */}
            <div className={`mt-8 p-5 rounded-xl ${
              currentTheme === 'neon' 
                ? 'bg-gray-700 border border-gray-600 shadow-lg' 
                : 'bg-white border border-gray-200 shadow-md'
            }`}>
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className={`w-5 h-5 ${
                  currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                }`} />
                <h4 className={`text-lg font-bold ${
                  currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                }`}>
                  Quick Stats
                </h4>
              </div>
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-2 rounded-lg ${
                  currentTheme === 'neon' 
                    ? 'bg-gray-600 border border-gray-500' 
                    : 'bg-gray-100 border border-gray-300'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Calendar className={`w-4 h-4 ${
                      currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                    }`} />
                    <span className={`text-sm font-medium ${
                      currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Tasks Today
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${
                    currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                  }`}>
                    5
                  </span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-lg ${
                  currentTheme === 'neon' 
                    ? 'bg-gray-600 border border-gray-500' 
                    : 'bg-gray-100 border border-gray-300'
                }`}>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`w-4 h-4 ${
                      currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                    }`} />
                    <span className={`text-sm font-medium ${
                      currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Completed
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${
                    currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                  }`}>
                    3/5
                  </span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-lg ${
                  currentTheme === 'neon' 
                    ? 'bg-gray-600 border border-gray-500' 
                    : 'bg-gray-100 border border-gray-300'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Flame className={`w-4 h-4 ${
                      currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                    }`} />
                    <span className={`text-sm font-medium ${
                      currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Streak
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${
                    currentTheme === 'neon' ? 'text-white' : 'text-gray-900'
                  }`}>
                    7 days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Content Area */}
          <div className={`flex-1 overflow-y-auto ${
            currentTheme === 'neon' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMethod}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderActiveComponent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TodoCreationHub;
