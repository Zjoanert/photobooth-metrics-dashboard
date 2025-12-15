import { LogEntry } from '../api/logsApi';

const normalizeMessage = (message: string | string[]): string =>
  Array.isArray(message) ? message.join(' ') : message;

const formatLogLine = (entry: LogEntry): string => {
  const timestamp = new Date(entry.timestamp).toISOString();
  const level = entry.level.toUpperCase();
  const message = normalizeMessage(entry.message);
  return `[${timestamp}] ${level} ${message}`;
};

const triggerLogDownload = (content: string, applicationId: string, date?: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateSuffix = date ? `-${date}` : '';
  link.download = `logs-${applicationId}${dateSuffix}.log`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadLogFile = (
  entries: LogEntry[],
  applicationId: string,
  date?: string | null,
): void => {
  if (!applicationId) {
    throw new Error('No application selected for log download');
  }

  const header = `Log export for ${applicationId}${date ? ` on ${date}` : ''}`;
  const lines = entries.length ? entries.map(formatLogLine) : ['(no log entries)'];
  const content = [header, '', ...lines].join('\n');
  triggerLogDownload(content, applicationId, date ?? undefined);
};
