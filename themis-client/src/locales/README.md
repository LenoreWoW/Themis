# Themis Internationalization Guide

This document provides guidelines for managing translations in the Themis application.

## Translation Structure

Translations are managed through two mechanisms:

1. **Main Translation Files**:
   - `src/i18n/en.ts` - English translations
   - `src/i18n/ar.ts` - Arabic translations

2. **JSON Translation Files** (alternative loading method):
   - `src/locales/en/translation.json` - English translations
   - `src/locales/ar/translation.json` - Arabic translations

## Adding or Modifying Translations

When adding new text to the application:

1. Add the text to both English and Arabic translation files
2. Use a structured key format: `namespace.group.item`
3. Always use translation functions instead of hardcoded text

Example:
```jsx
// Wrong
<Button>Save</Button>

// Correct
<Button>{t('common.save')}</Button>
```

## Adding a New Translation Key

1. Add the key to `src/i18n/en.ts`
2. Add the key to `src/i18n/ar.ts` with the Arabic translation
3. Update the JSON files if needed

Example:
```typescript
// In en.ts
export const enTranslations = {
  // ...
  myFeature: {
    title: "My Feature",
    description: "This is my new feature"
  }
}

// In ar.ts
export const arTranslations = {
  // ...
  myFeature: {
    title: "ميزتي",
    description: "هذه هي ميزتي الجديدة"
  }
}
```

## Best Practices

1. **Use Namespaces**: Group related translations under a common namespace
2. **Be Consistent**: Use the same structure across all translations
3. **Don't Split Sentences**: Avoid splitting sentences across multiple keys
4. **Use Parameters**: For dynamic content, use parameters like `{{name}}`
5. **Avoid HTML**: Don't include HTML in translation strings
6. **Test RTL**: Always test Arabic translations to ensure proper RTL layout

## Common Issues

### Missing Translations
If text appears in English when using Arabic mode, check:
- The translation key exists in the Arabic file
- The component is using the translation function (`t()`)
- The key is correctly referenced

### RTL Layout Issues
If layout appears incorrect in Arabic mode:
- Check that MUI's RTL plugin is applied
- Verify that directional CSS properties are relative to text direction
- Use logical properties (`margin-inline-start`) instead of directional ones (`margin-left`)

## Adding a New Language

To add a new language:
1. Create a new file `src/i18n/[lang-code].ts`
2. Add language to the language selector in `src/components/LanguageSwitcher.tsx`
3. Add language code to the supported languages in `src/i18n/index.ts` 