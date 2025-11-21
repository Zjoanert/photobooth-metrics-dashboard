import React from 'react';

interface DashboardToolbarProps {
  isEditMode: boolean;
  onToggleEditMode(): void;
  onAddTile(): void;
}

export const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  isEditMode,
  onToggleEditMode,
  onAddTile,
}) => {
  return (
    <div className="dashboard-toolbar">
      <button className="secondary" onClick={onToggleEditMode}>
        {isEditMode ? 'Stop editing' : 'Edit layout'}
      </button>
      <button className="primary" onClick={onAddTile}>
        Add tile
      </button>
    </div>
  );
};
