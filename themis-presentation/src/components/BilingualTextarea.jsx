import React from 'react';
import BilingualInput from './BilingualInput';

/**
 * A specialized component for multiline bilingual text input
 * Extends the BilingualInput component with textarea-specific defaults
 */
const BilingualTextarea = (props) => {
  return (
    <BilingualInput
      multiline={true}
      rows={4}
      {...props}
    />
  );
};

export default BilingualTextarea; 