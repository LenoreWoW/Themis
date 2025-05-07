import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormattedText } from '../FormattedText';

describe('FormattedText', () => {
  it('should render text with a humanized label', () => {
    render(<FormattedText text="save.report" />);
    expect(screen.getByText('Save Report')).toBeInTheDocument();
  });

  it('should pass through additional props to the Typography component', () => {
    render(<FormattedText text="save.report" data-testid="test-text" variant="h1" />);
    const text = screen.getByTestId('test-text');
    expect(text).toHaveTextContent('Save Report');
    expect(text).toHaveClass('MuiTypography-h1');
  });

  it('should handle simple labels without dots', () => {
    render(<FormattedText text="Save" />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should handle complex dotted labels', () => {
    render(<FormattedText text="cancel.form.action" />);
    expect(screen.getByText('Cancel Form Action')).toBeInTheDocument();
  });
}); 