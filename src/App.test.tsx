import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard title', () => {
  render(<App />);
  expect(screen.getAllByText(/Foto Monitoring/i).length).toBeGreaterThan(0);
});
