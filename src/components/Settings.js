import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoRefresh: false,
    theme: 'light',
    logsRetention: '30'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="settings">
      <h2>Admin Settings</h2>
      
      <div className="settings-form">
        <div className="setting-group">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleSettingChange('notifications', e.target.checked)}
            />
            Enable notifications
          </label>
        </div>
        
        <div className="setting-group">
          <label>
            <input
              type="checkbox"
              checked={settings.autoRefresh}
              onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
            />
            Auto-refresh dashboard
          </label>
        </div>
        
        <div className="setting-group">
          <label>
            Theme:
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
        
        <div className="setting-group">
          <label>
            Logs retention (days):
            <input
              type="number"
              value={settings.logsRetention}
              onChange={(e) => handleSettingChange('logsRetention', e.target.value)}
              min="1"
              max="365"
            />
          </label>
        </div>
        
        <button className="save-button">Save Settings</button>
      </div>
    </div>
  );
};

export default Settings; 