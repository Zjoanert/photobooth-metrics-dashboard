# Restart button enablement guide

The log panel now renders a **Restart server** button, but it is intentionally disabled because the backend restart endpoint does not yet exist. Follow the steps below to wire up the real endpoint and enable the control once the API is available.

1. **Confirm the endpoint URL and method.**
   - The placeholder client call lives in `src/api/serverManagementApi.ts` and assumes a `POST` request to `/servers/{serverId}/restart` relative to the configured API base URL.
   - Update the path, HTTP method, or request payload in `restartServer` once the backend contract is finalized.

2. **Handle authentication or headers if required.**
   - Add any tokens or headers to the `fetch` call inside `restartServer` if the endpoint requires them.

3. **Test the client call in isolation.**
   - Temporarily invoke `restartServer(settings.apiBaseUrl, '<sample-server-id>')` from a test harness or the browser console to validate the endpoint response once the server supports it.

4. **Enable the restart UI.**
   - In `src/components/LogsPage.tsx`, flip the `isRestartFeatureEnabled` constant to `true` (or replace it with a runtime feature flag) so the button becomes clickable.
   - The button lives in the `LogsActions` component; it will show a confirmation dialog before sending the request.

5. **Verify the end-to-end flow.**
   - Select a server in the log panel, click **Restart server**, accept the confirmation, and ensure the backend receives the restart request for the selected server id.
   - Update any user-facing messaging if the backend returns a more specific success payload.
