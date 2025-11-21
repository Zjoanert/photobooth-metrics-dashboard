import React, { useState } from 'react';
import { PresetKey, TileConfig, TileType, TimeRange } from '../dashboardTypes';
import { TIME_RANGE_LABELS } from '../utils/timeRange';

interface TileSettingsDialogProps {
  tile: TileConfig;
  open: boolean;
  onClose(): void;
  onSave(nextTile: TileConfig): void;
}

const presetOptions: { key: PresetKey; label: string; endpointKey: string; type: TileType }[] = [
  { key: 'totalPhotos', label: 'Total photos', endpointKey: 'totalPhotos', type: 'kpi' },
  {
    key: 'avgPhotoDuration',
    label: 'Avg. photo duration',
    endpointKey: 'avgPhotoDuration',
    type: 'kpi',
  },
  {
    key: 'avgUploadDuration',
    label: 'Avg. upload duration',
    endpointKey: 'avgUploadDuration',
    type: 'kpi',
  },
  {
    key: 'uploadSpeed',
    label: 'Upload speed',
    endpointKey: 'uploadSpeed',
    type: 'chart',
  },
];

export const TileSettingsDialog: React.FC<TileSettingsDialogProps> = ({
  tile,
  open,
  onClose,
  onSave,
}) => {
  const [draft, setDraft] = useState<TileConfig>(tile);
  const [usePreset, setUsePreset] = useState<boolean>(Boolean(tile.presetKey));

  const handlePresetChange = (key: string) => {
    const preset = presetOptions.find((p) => p.key === key);
    if (!preset) return;
    setDraft((prev) => ({
      ...prev,
      presetKey: preset.key,
      endpointKey: preset.endpointKey,
      type: preset.type,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
  };

  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true">
      <form className="dialog" onSubmit={handleSubmit}>
        <div className="dialog-header">
          <h3>Edit tile</h3>
        </div>
        <div className="dialog-body">
          <label className="field">
            <span>Label</span>
            <input
              type="text"
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            />
          </label>

          <fieldset className="field">
            <legend>Data source</legend>
            <label className="option">
              <input
                type="radio"
                checked={usePreset}
                onChange={() => setUsePreset(true)}
              />
              Use preset
            </label>
            {usePreset && (
              <select
                value={draft.presetKey ?? ''}
                onChange={(e) => handlePresetChange(e.target.value)}
              >
                <option value="">Select preset</option>
                {presetOptions.map((preset) => (
                  <option key={preset.key} value={preset.key}>
                    {preset.label}
                  </option>
                ))}
              </select>
            )}
            <label className="option">
              <input
                type="radio"
                checked={!usePreset}
                onChange={() => setUsePreset(false)}
              />
              Custom endpoint
            </label>
            {!usePreset && (
              <input
                type="text"
                value={draft.endpointKey}
                onChange={(e) =>
                  setDraft({ ...draft, endpointKey: e.target.value, presetKey: undefined })
                }
              />
            )}
          </fieldset>

          <label className="field">
            <span>Tile type</span>
            <select
              value={draft.type}
              onChange={(e) => setDraft({ ...draft, type: e.target.value as TileType })}
            >
              <option value="kpi">KPI</option>
              <option value="chart">Chart</option>
            </select>
          </label>

          <div className="field grid">
            <label>
              <span>Unit</span>
              <input
                type="text"
                value={draft.unit ?? ''}
                onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
              />
            </label>
            <label>
              <span>Decimals</span>
              <input
                type="number"
                min={0}
                max={4}
                value={draft.decimals ?? 0}
                onChange={(e) =>
                  setDraft({ ...draft, decimals: Number(e.target.value) || 0 })
                }
              />
            </label>
          </div>

          <label className="field">
            <span>Time range</span>
            <div className="option-row">
              <label className="option">
                <input
                  type="radio"
                  checked={draft.timeMode === 'global'}
                  onChange={() =>
                    setDraft({ ...draft, timeMode: 'global', overrideTimeRange: undefined })
                  }
                />
                Follow global
              </label>
              <label className="option">
                <input
                  type="radio"
                  checked={draft.timeMode === 'override'}
                  onChange={() =>
                    setDraft({ ...draft, timeMode: 'override', overrideTimeRange: TimeRange.Today })
                  }
                />
                Override
              </label>
              {draft.timeMode === 'override' && (
                <select
                  value={draft.overrideTimeRange}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      overrideTimeRange: e.target.value as TimeRange,
                    })
                  }
                >
                  {[TimeRange.Today, TimeRange.Month, TimeRange.Always].map((range) => (
                    <option key={range} value={range}>
                      {TIME_RANGE_LABELS[range]}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </label>
        </div>
        <div className="dialog-footer">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};
