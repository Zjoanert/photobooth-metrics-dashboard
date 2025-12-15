import React from 'react';

interface LogsActionsProps {
  downloadDisabled: boolean;
  restartDisabled: boolean;
  isDownloading: boolean;
  isRestarting: boolean;
  onDownload: () => void;
  onRestart: () => void;
}

export const LogsActions: React.FC<LogsActionsProps> = ({
  downloadDisabled,
  restartDisabled,
  isDownloading,
  isRestarting,
  onDownload,
  onRestart,
}) => {
  return (
    <div className="logs-actions">
      <button className="secondary" onClick={onDownload} disabled={downloadDisabled}>
        {isDownloading ? 'Preparing log file…' : 'Download log file'}
      </button>
      <button className="secondary" onClick={onRestart} disabled={restartDisabled}>
        {isRestarting ? 'Restarting…' : 'Restart server'}
      </button>
    </div>
  );
};
