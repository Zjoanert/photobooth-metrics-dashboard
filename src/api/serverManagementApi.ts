export const restartServer = async (baseUrl: string, serverId: string): Promise<void> => {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const response = await fetch(
    `${normalizedBaseUrl}/servers/${encodeURIComponent(serverId)}/restart`,
    {
      method: 'POST',
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to restart server: ${response.status} ${response.statusText}`);
  }
};
