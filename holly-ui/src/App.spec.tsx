import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders Holly link', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Holly/i);
  expect(linkElement).toBeInTheDocument();
});
