import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function Settings() {
  const { t } = useTranslation();
  
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: t('language.english')
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
      <h2>{t('settings.title')}</h2>
      <div className="settings-section">
        <h3>{t('settings.preferences')}</h3>
        <div className="setting-item">
          <label>
            <input 
              type="checkbox" 
              checked={settings.notifications} 
              onChange={() => handleToggleChange('notifications')}
            />
            {t('settings.enableNotifications')}
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input 
              type="checkbox" 
              checked={settings.darkMode} 
              onChange={() => handleToggleChange('darkMode')}
            />
            {t('settings.darkMode')}
          </label>
        </div>
        <div className="setting-item">
          <label>
            {t('settings.language')}:
            <select value={settings.language} onChange={handleLanguageChange}>
              <option value={t('language.english')}>{t('language.english')}</option>
              <option value={t('language.arabic')}>{t('language.arabic')}</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Settings; 