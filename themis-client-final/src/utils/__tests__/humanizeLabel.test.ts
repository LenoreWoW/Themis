import { humanizeLabel } from '../humanizeLabel';

describe('humanizeLabel', () => {
  it('should transform a dotted label into a human-readable format', () => {
    expect(humanizeLabel('save.report')).toBe('Save Report');
    expect(humanizeLabel('cancel.form.action')).toBe('Cancel Form Action');
    expect(humanizeLabel('send.email.notification')).toBe('Send Email Notification');
  });

  it('should handle single word inputs', () => {
    expect(humanizeLabel('save')).toBe('Save');
    expect(humanizeLabel('cancel')).toBe('Cancel');
  });

  it('should handle empty strings', () => {
    expect(humanizeLabel('')).toBe('');
  });

  it('should handle null and undefined', () => {
    expect(humanizeLabel(null)).toBe('');
    expect(humanizeLabel(undefined)).toBe('');
  });
  
  it('should handle labels with consecutive dots', () => {
    expect(humanizeLabel('save..report')).toBe('Save Report');
    expect(humanizeLabel('cancel...action')).toBe('Cancel Action');
  });
}); 