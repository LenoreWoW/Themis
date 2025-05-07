# Themis Arabic ⇄ English Localization System

This document describes the comprehensive Arabic-English localization system implemented in the Themis Project Management System. The localization system is designed to provide a seamless, high-performance bilingual experience with no compromise on speed or user experience.

## 🌐 Overview

The Themis localization system provides complete Arabic and English language support throughout the application, with:

- Instant language switching (English ⇄ Arabic) for all UI components
- Proper Right-to-Left (RTL) support for Arabic language
- Consistent Western number display (0-9) regardless of language
- Dynamic translation of user-generated content
- Performance optimizations to ensure minimal impact on application speed

## 🔧 Technical Architecture

### Core Components

1. **i18n Configuration (`src/i18n/index.ts`)**
   - Powers the entire translation system
   - Handles language detection and switching
   - Manages RTL/LTR document direction
   - Ensures correct number formatting

2. **Translation Files**
   - English: `src/i18n/locales/en/translation.json`
   - Arabic: `src/i18n/locales/ar/translation.json`

3. **Custom Hooks & Components**
   - `useLocalizedText`: Enhanced translation hook with memoization
   - `LocalizedNumber`: Component for consistent number display
   - `BiDiFlexBox`: Direction-aware flexible box component
   - `DynamicTranslation`: Component for user-generated content

4. **CSS & Layout Utilities**
   - `src/styles/bidi.css`: Global bidirectional styling
   - Direction-aware CSS variables

5. **Backend Services**
   - `TranslationService`: Handles dynamic content translation with caching

## 🚀 Features

### 1. Complete UI Translation

Every text element in the application is translatable, with translations managed through structured JSON files:

```json
// English
{
  "projects": {
    "title": "Projects",
    "newProject": "New Project"
  }
}

// Arabic
{
  "projects": {
    "title": "المشاريع",
    "newProject": "مشروع جديد"
  }
}
```

### 2. RTL Support

Arabic language receives full RTL support, including:

- Reversed layout direction
- Right-aligned text
- Mirrored UI components
- Correct text flow

### 3. Western Numeric Display

Numbers are consistently displayed using Western digits (0-9) in both languages for clarity and to avoid confusion, particularly in technical contexts.

### 4. Dynamic Content Translation

User-generated content (project descriptions, comments, etc.) can be:

- Authored in either language
- Automatically detected for language
- Translated on-demand when viewed in the other language
- Cached for performance

### 5. Performance Optimizations

- Lazy-loaded translation bundles
- Memoized translation functions
- Translation caching system
- Batched rendering updates

## 💻 Usage Guide

### Basic Translation

Use the `useTranslation` hook from react-i18next:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('projects.title')}</h1>; // "Projects" or "المشاريع"
}
```

### Enhanced Translation (Recommended)

Use our custom `useLocalizedText` hook for better performance:

```tsx
import useLocalizedText from '../hooks/useLocalizedText';

function MyComponent() {
  const { translate, isRTL, formatNumber } = useLocalizedText();
  
  return (
    <div className={isRTL ? 'rtl-class' : 'ltr-class'}>
      <h1>{translate('projects.title')}</h1>
      <p>{formatNumber(1234.56)}</p>
    </div>
  );
}
```

### Displaying Numbers

Use the `LocalizedNumber` component for consistent number formatting:

```tsx
import LocalizedNumber from '../components/common/LocalizedNumber';

function MyComponent() {
  return (
    <div>
      Budget: <LocalizedNumber value={10000} />
    </div>
  );
}
```

### RTL-Aware Layouts

Use the `BiDiFlexBox` component for direction-aware layouts:

```tsx
import BiDiFlexBox from '../components/common/BiDiFlexBox';

function MyComponent() {
  return (
    <BiDiFlexBox ltrDirection="row" responsive={true}>
      <div>First item</div>
      <div>Second item</div>
    </BiDiFlexBox>
  );
}
```

### Translating User Content

Use the `DynamicTranslation` component for user-generated content:

```tsx
import DynamicTranslation from '../components/common/DynamicTranslation';

function ProjectDescription({ description }) {
  return (
    <div className="project-description">
      <DynamicTranslation content={description} />
    </div>
  );
}
```

## 🛠️ Development Best Practices

1. **Always Use Translation Keys**
   - Never hardcode UI text
   - Use nested keys to organize translations logically

2. **Maintain Both Translation Files**
   - Keep English and Arabic translations in sync
   - Use authentic Arabic translations, not just machine translation

3. **Test in Both Languages**
   - Regularly toggle between languages during development
   - Verify layout and UI in both RTL and LTR modes

4. **Handle Dynamic Text Properly**
   - Account for text expansion in Arabic (can be 20-30% longer)
   - Use flexible layouts that can accommodate varying text lengths

5. **Follow RTL Design Principles**
   - Icons and graphics may need mirroring
   - Direction-sensitive elements (arrows, sorting indicators) should adapt

6. **Use Western Digits Consistently**
   - Always format numbers with `formatNumber()` or `<LocalizedNumber />`
   - This ensures all numeric values use 0-9 instead of Arabic digits

## 📚 API Reference

### Translation Hooks

#### `useTranslation()`
The standard react-i18next hook.

#### `useLocalizedText()`
Enhanced hook with additional utilities:
- `translate(key, options)`: Translate a key with interpolation
- `formatNumber(num, options)`: Format numbers with Western digits
- `formatDate(date, options)`: Format dates according to the current locale
- `getDirectionClass()`: Get the appropriate CSS class for text direction
- `isRTL`: Boolean indicating whether the current language is RTL
- `dir`: Current direction string ('rtl' or 'ltr')

### Components

#### `<LocalizedNumber value={number} />`
Display numbers consistently with Western digits.

#### `<BiDiFlexBox ltrDirection="row" />`
Direction-aware flexible box container.

#### `<DynamicTranslation content={string} />`
Handle user-generated content with translation capability.

### Services

#### `TranslationService`
- `translateText(content, fromLang, toLang)`: Translate a string
- `translateObject(obj, fields, fromLang, toLang)`: Translate specific fields in an object
- `preTranslateCollection(items, fields, fromLang, toLang)`: Batch translate a collection

## 🤝 Contributing to Localization

1. **Adding New Translations**
   - Always add keys to both language files
   - Maintain the same structure in both files
   - Group related translations under common namespace keys

2. **Translation Quality**
   - Use professional translators for critical content
   - For Arabic, consider regional dialect variations
   - Be aware of cultural contexts and adapt where necessary

3. **Testing Translations**
   - Use the language switcher to verify all UI elements
   - Check text overflow, alignment, and layout issues
   - Verify numerical values display correctly

4. **Reporting Issues**
   - If you find missing translations, report them with specific location/context
   - Note any RTL layout problems with screenshots
   - Suggest better translations if existing ones are awkward/incorrect

## 🚨 Troubleshooting

### Missing Translations
If you see the translation key displayed instead of translated text:
1. Check that the key exists in both language files
2. Verify the key's namespace and structure
3. Try clearing browser cache/local storage

### RTL Layout Issues
If RTL layout appears broken:
1. Use `BiDiFlexBox` instead of standard flexbox containers
2. Ensure the component isn't forcing specific directions
3. Add direction-specific margin/padding using CSS variables

### Performance Problems
If translations cause performance issues:
1. Use `useLocalizedText()` with memoization
2. Avoid unnecessarily nested translation keys
3. Pre-translate user content when possible instead of on-demand

## 📋 Conclusion

This comprehensive localization system provides a seamless bilingual experience while maintaining performance. By following these guidelines and using the provided utilities, you can contribute to a consistent, high-quality multilingual application.

For any questions or suggestions regarding localization, please contact the development team. 