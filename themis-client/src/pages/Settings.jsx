import React, { useState } from 'react';

function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'English'
  });

  const handleToggleChange = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };

  const handleLanguageChange = (e) => {
    setSettings({
      ...settings,
      language: e.target.value
    });
  };

  return (
    <div className="settings">
      <h2>Settings</h2>
      <div className="settings-section">
        <h3>Preferences</h3>
        <div className="setting-item">
          <label>
            <input 
              type="checkbox" 
              checked={settings.notifications} 
              onChange={() => handleToggleChange('notifications')}
            />
            Enable Notifications
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input 
              type="checkbox" 
              checked={settings.darkMode} 
              onChange={() => handleToggleChange('darkMode')}
            />
            Dark Mode
          </label>
        </div>
        <div className="setting-item">
          <label>
            Language:
            <select value={settings.language} onChange={handleLanguageChange}>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Settings; 