import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormattedButton } from '../FormattedButton';

describe('FormattedButton', () => {
  it('should render a button with a humanized label', () => {
    render(<FormattedButton label="save.report" />);
    expect(screen.getByText('Save Report')).toBeInTheDocument();
  });

  it('should pass through additional props to the Button component', () => {
    render(<FormattedButton label="save.report" data-testid="test-button" variant="contained" />);
    const button = screen.getByTestId('test-button');
    expect(button).toHaveTextContent('Save Report');
    expect(button).toHaveClass('MuiButton-contained');
  });

  it('should handle simple labels without dots', () => {
    render(<FormattedButton label="Save" />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should handle complex dotted labels', () => {
    render(<FormattedButton label="cancel.form.action" />);
    expect(screen.getByText('Cancel Form Action')).toBeInTheDocument();
  });
}); 