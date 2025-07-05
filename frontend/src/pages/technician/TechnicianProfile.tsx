// frontend/src/pages/technician/TechnicianProfile.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  UserCircleIcon,
  CogIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  BellIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface TechnicianPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  desktopNotifications: boolean;
  escalationAlerts: boolean;
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  availability: 'available' | 'busy' | 'away';
  autoAssignment: boolean;
  maxConcurrentTickets: number;
  skillTags: string[];
}

const TechnicianProfile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<TechnicianPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    desktopNotifications: true,
    escalationAlerts: true,
    workingHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'Asia/Jakarta'
    },
    availability: 'available',
    autoAssignment: true,
    maxConcurrentTickets: 10,
    skillTags: ['windows', 'network', 'banking-systems']
  });

  const [stats] = useState({
    totalTicketsResolved: 342,
    avgResolutionTime: '2.3 hours',
    customerSatisfaction: 4.8,
    currentStreak: 12,
    thisMonthResolved: 28,
    escalationRate: '2.1%'
  });

  useEffect(() => {
    // Load user preferences from API
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      // Mock API call - in real implementation, load from backend
      // const response = await userService.getPreferences();
      // setPreferences(response.data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      // Mock API call - in real implementation, save to backend
      // await userService.updatePreferences(preferences);
      console.log('Preferences saved:', preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof TechnicianPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateWorkingHours = (key: keyof TechnicianPreferences['workingHours'], value: string) => {
    setPreferences(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [key]: value
      }
    }));
  };

  const addSkillTag = (tag: string) => {
    if (tag && !preferences.skillTags.includes(tag)) {
      setPreferences(prev => ({
        ...prev,
        skillTags: [...prev.skillTags, tag]
      }));
    }
  };

  const removeSkillTag = (tag: string) => {
    setPreferences(prev => ({
      ...prev,
      skillTags: prev.skillTags.filter(t => t !== tag)
    }));
  };

  const availabilityOptions = [
    { value: 'available', label: 'Available', color: 'text-green-600 bg-green-50 border-green-200' },
    { value: 'busy', label: 'Busy', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { value: 'away', label: 'Away', color: 'text-red-600 bg-red-50 border-red-200' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <UserCircleIcon className="w-8 h-8 mr-3 text-slate-600" />
          Technician Profile
        </h1>
        <p className="text-slate-600 mt-1">
          Manage your profile, preferences, and work settings
        </p>
      </div>

      {/* Profile Overview */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-800 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <UserCircleIcon className="w-12 h-12" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user?.name || 'Technician'}</h2>
            <p className="text-slate-200">{user?.email}</p>
            <p className="text-slate-300 text-sm">
              {user?.department?.name || 'IT Support'} • {user?.unit?.name || 'Main Office'}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                availabilityOptions.find(opt => opt.value === preferences.availability)?.color || 'text-slate-600 bg-slate-50 border-slate-200'
              }`}>
                {availabilityOptions.find(opt => opt.value === preferences.availability)?.label}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.currentStreak}</div>
            <div className="text-slate-300 text-sm">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
          <ChartBarIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-900">{stats.totalTicketsResolved}</div>
          <div className="text-sm text-slate-600">Total Resolved</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
          <ClockIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-900">{stats.avgResolutionTime}</div>
          <div className="text-sm text-slate-600">Avg Resolution</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
          <div className="text-2xl font-bold text-slate-900">{stats.customerSatisfaction}</div>
          <div className="text-sm text-slate-600">Satisfaction</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
          <div className="text-2xl font-bold text-slate-900">{stats.thisMonthResolved}</div>
          <div className="text-sm text-slate-600">This Month</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
          <div className="text-2xl font-bold text-slate-900">{stats.escalationRate}</div>
          <div className="text-sm text-slate-600">Escalation Rate</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
          <div className="text-2xl font-bold text-slate-900">{stats.currentStreak}</div>
          <div className="text-sm text-slate-600">Current Streak</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Availability Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-blue-500" />
            Availability & Working Hours
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Status</label>
              <div className="flex space-x-2">
                {availabilityOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => updatePreference('availability', option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      preferences.availability === option.value
                        ? option.color
                        : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={preferences.workingHours.start}
                  onChange={(e) => updateWorkingHours('start', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={preferences.workingHours.end}
                  onChange={(e) => updateWorkingHours('end', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
              <select
                value={preferences.workingHours.timezone}
                onChange={(e) => updateWorkingHours('timezone', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-slate-900">Auto Assignment</div>
                <div className="text-sm text-slate-600">Automatically assign new tickets during working hours</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.autoAssignment}
                onChange={(e) => updatePreference('autoAssignment', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Max Concurrent Tickets: {preferences.maxConcurrentTickets}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={preferences.maxConcurrentTickets}
                onChange={(e) => updatePreference('maxConcurrentTickets', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <BellIcon className="w-5 h-5 mr-2 text-yellow-500" />
            Notification Preferences
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-slate-500" />
                <div>
                  <div className="font-medium text-slate-900">Email Notifications</div>
                  <div className="text-sm text-slate-600">Receive ticket updates via email</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <DevicePhoneMobileIcon className="w-5 h-5 text-slate-500" />
                <div>
                  <div className="font-medium text-slate-900">SMS Notifications</div>
                  <div className="text-sm text-slate-600">Urgent tickets and escalations</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.smsNotifications}
                onChange={(e) => updatePreference('smsNotifications', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <GlobeAltIcon className="w-5 h-5 text-slate-500" />
                <div>
                  <div className="font-medium text-slate-900">Desktop Notifications</div>
                  <div className="text-sm text-slate-600">Browser push notifications</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.desktopNotifications}
                onChange={(e) => updatePreference('desktopNotifications', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="w-5 h-5 text-slate-500" />
                <div>
                  <div className="font-medium text-slate-900">Escalation Alerts</div>
                  <div className="text-sm text-slate-600">High priority escalations</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.escalationAlerts}
                onChange={(e) => updatePreference('escalationAlerts', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Skills and Expertise */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <CogIcon className="w-5 h-5 mr-2 text-green-500" />
          Skills & Expertise
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Skill Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {preferences.skillTags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeSkillTag(tag)}
                    className="ml-1 w-4 h-4 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add skill tag..."
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    addSkillTag(input.value);
                    input.value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                  addSkillTag(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={savePreferences}
          disabled={saving}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Save Preferences</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TechnicianProfile;