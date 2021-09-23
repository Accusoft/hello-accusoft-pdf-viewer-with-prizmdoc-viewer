import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Hello Accusoft PDF Viewer with PrizmDoc Viewer header', () => {
  render(<App />);
  const linkElement = screen.getByText(/Hello Accusoft PDF Viewer with PrizmDoc Viewer/i);
  expect(linkElement).toBeInTheDocument();
});
