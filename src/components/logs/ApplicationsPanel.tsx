import React from 'react';

interface Application {
  id: string;
  label: string;
}

interface ApplicationsPanelProps {
  applications: Application[];
  selectedApp: string;
  customAppInput: string;
  onSelectApp: (appId: string) => void;
  onCustomAppChange: (value: string) => void;
}

export const ApplicationsPanel: React.FC<ApplicationsPanelProps> = ({
  applications,
  selectedApp,
  customAppInput,
  onSelectApp,
  onCustomAppChange,
}) => {
  return (
    <aside className="logs-app-tabs" aria-label="Applications">
      {applications.map((app) => (
        <button
          key={app.id}
          className={selectedApp === app.id ? 'tab active' : 'tab'}
          onClick={() => onSelectApp(app.id)}
        >
          {app.label}
        </button>
      ))}

      <div className="custom-app">
        <label className="field compact">
          <span>Custom application</span>
          <input
            type="text"
            placeholder="Enter application id"
            value={customAppInput}
            onChange={(e) => onCustomAppChange(e.target.value)}
          />
          <p className="muted helper-text">Fetch logs for any service name.</p>
        </label>
      </div>
    </aside>
  );
};
