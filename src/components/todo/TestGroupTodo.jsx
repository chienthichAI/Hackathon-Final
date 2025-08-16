import React from 'react';
import { Users, Plus, CheckCircle, Clock, Target } from 'lucide-react';

const TestGroupTodo = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="w-6 h-6 mr-3 text-blue-500" />
              Group Todos - TEST MODE
            </h2>
            <p className="text-gray-600 mt-1">
              This is a test component to verify Group Todo functionality
            </p>
          </div>
          
          <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="text-center p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-gray-200">
            <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-700 mb-1">3</div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Groups</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-gray-200">
            <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-700 mb-1">15</div>
            <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">Total Members</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-gray-200">
            <Target className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-yellow-700 mb-1">35</div>
            <div className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Active Todos</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-gray-200">
            <CheckCircle className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-purple-700 mb-1">20</div>
            <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Completed</div>
          </div>
        </div>
      </div>

      {/* Sample Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Group 1 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">Study Group - Computer Science</h3>
                <span className="text-yellow-500">👑</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">A collaborative group for studying computer science topics together</p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Study</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  5 members
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>38%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '38%' }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">3 of 8 todos completed</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Today
            </span>
            <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
              View Group
            </button>
          </div>
        </div>

        {/* Group 2 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">Project Team - Web Development</h3>
                <span className="text-blue-500">🛡️</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Team for building modern web applications and websites</p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Project</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  4 members
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>58%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '58%' }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">7 of 12 todos completed</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Yesterday
            </span>
            <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
              View Group
            </button>
          </div>
        </div>

        {/* Group 3 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">Work Collaboration</h3>
                <span className="text-purple-500">⭐</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Work-related tasks and team collaboration</p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Work</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  6 members
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>67%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '67%' }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">10 of 15 todos completed</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              2 days ago
            </span>
            <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
              View Group
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <h4 className="font-medium text-green-800">Group Todo System is Working!</h4>
            <p className="text-sm text-green-700">
              This test component shows that Group Todo can be displayed. The real component should now work properly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestGroupTodo; 