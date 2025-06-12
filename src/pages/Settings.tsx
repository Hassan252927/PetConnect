import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { toggleDarkMode, setFontSize, toggleNotifications } from '../store/settingsSlice';
import Layout from '../components/layout/Layout';

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { darkMode, fontSize, notifications } = useAppSelector((state) => state.settings);
  const { currentUser } = useAppSelector((state) => state.user);

  // Settings sections
  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'darkMode',
          name: 'Dark Mode',
          description: 'Enable dark mode for a better night-time viewing experience',
          type: 'toggle',
          value: darkMode,
          onChange: () => dispatch(toggleDarkMode()),
        },
        {
          id: 'fontSize',
          name: 'Font Size',
          description: 'Adjust the text size throughout the application',
          type: 'select',
          value: fontSize,
          options: [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ],
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => 
            dispatch(setFontSize(e.target.value as 'small' | 'medium' | 'large')),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'enableNotifications',
          name: 'Enable Notifications',
          description: 'Receive notifications for messages, likes, and comments',
          type: 'toggle',
          value: notifications,
          onChange: () => dispatch(toggleNotifications()),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'email',
          name: 'Email',
          description: 'Change your email address',
          type: 'link',
          value: currentUser?.email,
          linkText: 'Change Email',
          linkPath: '/settings/email',
        },
        {
          id: 'password',
          name: 'Password',
          description: 'Update your password',
          type: 'link',
          value: '••••••••',
          linkText: 'Change Password',
          linkPath: '/settings/password',
        },
      ],
    },
  ];

  // Render setting item based on type
  const renderSettingItem = (item: any) => {
    switch (item.type) {
      case 'toggle':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={item.value} 
              onChange={item.onChange} 
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        );
      case 'select':
        return (
          <select
            id={item.id}
            value={item.value}
            onChange={item.onChange}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-200"
          >
            {item.options.map((option: any) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        );
      case 'link':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400">{item.value}</span>
            <a href={item.linkPath} className="text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              {item.linkText}
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Customize your PetConnect experience</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8 transition-colors duration-200">
          {settingsSections.map((section, index) => (
            <div key={section.title} className={`${index > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                <h2 className="text-lg font-medium text-gray-800 dark:text-white">{section.title}</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {section.items.map((item) => (
                  <div key={item.id} className="px-6 py-5 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-medium text-gray-800 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                    {renderSettingItem(item)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8 transition-colors duration-200">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">About</h2>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <span className="text-lg">🐾</span>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800 dark:text-white">PetConnect</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Version 1.0.0</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              PetConnect is a social platform for pet lovers to share moments, find advice, and join the world's most pawsome pet community.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings; 