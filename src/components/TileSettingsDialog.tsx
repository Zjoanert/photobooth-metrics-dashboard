import React, { useState } from 'react';
import {
  KpiStat,
  PresetKey,
  TileConfig,
  TileType,
  TimeRange,
  TimeRangeValue,
} from '../dashboardTypes';
import { getDefaultKpiStatForEndpoint } from '../api/dashboardEventApi';
import {
  TIME_RANGE_LABELS,
  createDefaultCustomRange,
  ensureValidCustomRange,
  fromInputDateTimeValue,
  isCustomRange,
  toInputDateTimeValue,
} from '../utils/timeRange';

interface TileSettingsDialogProps {
  tile: TileConfig;
  open: boolean;
  onClose(): void;
  onSave(nextTile: TileConfig): void;
}

const presetOptions: {
  key: PresetKey;
  label: string;
  endpointKey: string;
  type: TileType;
  applicationName: string;
  eventName: string;
  defaultStat?: KpiStat;
}[] = [
  {
    key: 'totalPhotos',
    label: "Totaal aantal foto's",
    endpointKey: 'totalPhotos',
    type: 'kpi',
    applicationName: 'frontend',
    eventName: 'totalPhotos',
    defaultStat: 'sum',
  },
  {
    key: 'avgPhotoDuration',
    label: 'Gemiddelde fotoduur',
    endpointKey: 'avgPhotoDuration',
    type: 'kpi',
    applicationName: 'frontend',
    eventName: 'avgPhotoDuration',
    defaultStat: 'average',
  },
  {
    key: 'avgUploadDuration',
    label: 'Gemiddelde uploadduur',
    endpointKey: 'avgUploadDuration',
    type: 'kpi',
    applicationName: 'frontend',
    eventName: 'avgUploadDuration',
    defaultStat: 'average',
  },
  {
    key: 'totalPrints',
    label: 'Totaal aantal afdrukken',
    endpointKey: 'totalPrints',
    type: 'kpi',
    applicationName: 'print',
    eventName: 'totalPrints',
    defaultStat: 'sum',
  },
  {
    key: 'uploadSpeed',
    label: 'Uploadsnelheid',
    endpointKey: 'uploadSpeed',
    type: 'chart',
    applicationName: 'frontend',
    eventName: 'uploadSpeed',
  },
];

const KPI_STAT_LABELS: Record<KpiStat, string> = {
  count: 'Count',
  sum: 'Sum',
  average: 'Average',
  min: 'Minimum',
  max: 'Maximum',
};

export const TileSettingsDialog: React.FC<TileSettingsDialogProps> = ({
  tile,
  open,
  onClose,
  onSave,
}) => {
  const [draft, setDraft] = useState<TileConfig>(tile);
  const [usePreset, setUsePreset] = useState<boolean>(Boolean(tile.presetKey));
  const selectedKpiStat =
    draft.kpiStat ?? getDefaultKpiStatForEndpoint(draft.endpointKey);
  const overrideRange = draft.overrideTimeRange ?? TimeRange.Today;

  const handlePresetChange = (key: string) => {
    const preset = presetOptions.find((p) => p.key === key);
    if (!preset) return;
    setDraft((prev) => ({
      ...prev,
      presetKey: preset.key,
      endpointKey: preset.endpointKey,
      type: preset.type,
      applicationName: preset.applicationName,
      eventName: preset.eventName,
      kpiStat: preset.defaultStat ?? prev.kpiStat,
    }));
  };

  const handleCustomEndpointSelect = () => {
    const preset = draft.presetKey
      ? presetOptions.find((p) => p.key === draft.presetKey)
      : undefined;

    setUsePreset(false);
    setDraft((prev) => ({
      ...prev,
      presetKey: undefined,
      applicationName: prev.applicationName ?? preset?.applicationName ?? '',
      eventName: prev.eventName ?? preset?.eventName ?? '',
      endpointKey:
        prev.endpointKey || preset?.endpointKey || prev.eventName || 'custom',
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
                className="select-control"
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
                onChange={handleCustomEndpointSelect}
              />
              Custom endpoint
            </label>
            {!usePreset && (
              <div className="field grid">
                <label>
                  <span>Application</span>
                  <input
                    type="text"
                    value={draft.applicationName ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        applicationName: e.target.value,
                        endpointKey: draft.endpointKey || draft.eventName || 'custom',
                        presetKey: undefined,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Event</span>
                  <input
                    type="text"
                    value={draft.eventName ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        eventName: e.target.value,
                        endpointKey: e.target.value || draft.endpointKey || 'custom',
                        presetKey: undefined,
                      })
                    }
                  />
                </label>
              </div>
            )}
          </fieldset>

          <label className="field">
            <span>Endpoint type</span>
            <select
              className="select-control"
              value={draft.type}
              onChange={(e) => setDraft({ ...draft, type: e.target.value as TileType })}
            >
              <option value="kpi">Stats</option>
              <option value="chart">Time series</option>
              <option value="recency">Time since last event</option>
            </select>
          </label>

          {draft.type === 'kpi' && (
            <label className="field">
              <span>Statistic</span>
              <select
                className="select-control"
                value={selectedKpiStat}
                onChange={(e) =>
                  setDraft({ ...draft, kpiStat: e.target.value as KpiStat })
                }
              >
                {Object.entries(KPI_STAT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}

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
                    setDraft({
                      ...draft,
                      timeMode: 'override',
                      overrideTimeRange: draft.overrideTimeRange ?? TimeRange.Today,
                    })
                  }
                />
                Override
              </label>
              {draft.timeMode === 'override' && (
                <div className="custom-range-picker">
                  <select
                    className="select-control compact"
                    value={isCustomRange(overrideRange) ? 'custom' : overrideRange}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDraft({
                        ...draft,
                        overrideTimeRange:
                          value === 'custom'
                            ? createDefaultCustomRange()
                            : (value as TimeRangeValue),
                      });
                    }}
                  >
                    {[TimeRange.Today, TimeRange.Month, TimeRange.Always].map((range) => (
                      <option key={range} value={range}>
                        {TIME_RANGE_LABELS[range]}
                      </option>
                    ))}
                    <option value="custom">Custom</option>
                  </select>
                  {isCustomRange(overrideRange) && (
                    <div className="custom-range-fields">
                      <label className="hint">
                        Start
                        <input
                          type="datetime-local"
                          value={toInputDateTimeValue(overrideRange.start)}
                          onChange={(e) => {
                            const iso = fromInputDateTimeValue(e.target.value);
                            if (!iso) return;
                            setDraft({
                              ...draft,
                              overrideTimeRange: ensureValidCustomRange({
                                ...overrideRange,
                                start: iso,
                              }),
                            });
                          }}
                        />
                      </label>
                      <label className="hint">
                        End
                        <input
                          type="datetime-local"
                          value={toInputDateTimeValue(overrideRange.end)}
                          onChange={(e) => {
                            const iso = fromInputDateTimeValue(e.target.value);
                            if (!iso) return;
                            setDraft({
                              ...draft,
                              overrideTimeRange: ensureValidCustomRange({
                                ...overrideRange,
                                end: iso,
                              }),
                            });
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
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
