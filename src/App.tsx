import React from 'react';
import './App.css';
import { DashboardPage } from './components/DashboardPage';
import { ApiProvider } from './context/ApiContext';
import { MockEventApi } from './api/dashboardEventApi';

const App: React.FC = () => {
  const eventApi = React.useMemo(() => new MockEventApi(), []);

  return (
    <ApiProvider eventApi={eventApi}>
      <DashboardPage />
    </ApiProvider>
  );
};

export default App;
