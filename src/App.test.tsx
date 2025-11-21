import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard title', () => {
  render(<App />);
  expect(screen.getByText(/Foto Monitoring/i)).toBeInTheDocument();
});
