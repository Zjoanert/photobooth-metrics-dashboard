import React from 'react';

interface DashboardToolbarProps {
  isEditMode: boolean;
  onToggleEditMode(): void;
  onAddTile(): void;
  onDownloadCsv(): void;
  isDownloading?: boolean;
}

export const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  isEditMode,
  onToggleEditMode,
  onAddTile,
  onDownloadCsv,
  isDownloading,
}) => {
  return (
    <div className="dashboard-toolbar">
      <button className="secondary" onClick={onToggleEditMode}>
        {isEditMode ? 'Stop editing' : 'Edit layout'}
      </button>
      <button className="secondary" onClick={onDownloadCsv} disabled={isDownloading}>
        {isDownloading ? 'Preparing CSV…' : 'Download CSV'}
      </button>
      <button className="primary" onClick={onAddTile}>
        Add tile
      </button>
    </div>
  );
};
