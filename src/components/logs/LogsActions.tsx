import React from 'react';

interface LogsActionsProps {
  disabled: boolean;
  isDownloading: boolean;
  onDownload: () => void;
}

export const LogsActions: React.FC<LogsActionsProps> = ({ disabled, isDownloading, onDownload }) => {
  return (
    <div className="logs-actions">
      <button className="secondary" onClick={onDownload} disabled={disabled}>
        {isDownloading ? 'Preparing log file…' : 'Download log file'}
      </button>
    </div>
  );
};
