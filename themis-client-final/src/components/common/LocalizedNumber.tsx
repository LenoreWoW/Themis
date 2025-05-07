import React from 'react';
import { useTranslation } from 'react-i18next';

interface LocalizedNumberProps {
  value: number;
  formatOptions?: Intl.NumberFormatOptions;
  className?: string;
  style?: React.CSSProperties;
}

// Create an extended options type that includes numberingSystem
interface ExtendedNumberFormatOptions extends Intl.NumberFormatOptions {
  numberingSystem?: string;
}

/**
 * A component that ensures numbers are displayed consistently
 * regardless of the current language setting.
 * 
 * Always uses Western arabic numerals (0-9) for both English and Arabic.
 */
const LocalizedNumber: React.FC<LocalizedNumberProps> = ({
  value,
  formatOptions,
  className,
  style
}) => {
  const { i18n } = useTranslation();
  
  // Format the number based on the current locale but always use Western digits
  const formattedNumber = new Intl.NumberFormat(
    i18n.language === 'ar' ? 'ar-QA' : 'en-US', 
    {
      // Default options
      useGrouping: true,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      // Override with custom options
      ...formatOptions,
      // Force Western numerals for Arabic
      numberingSystem: 'latn',
    } as ExtendedNumberFormatOptions
  ).format(value);

  return (
    <span className={className} style={style}>
      {formattedNumber}
    </span>
  );
};

export default LocalizedNumber; 