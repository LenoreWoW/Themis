# Themis Translation System

This document provides an overview of the Themis translation system, which allows for fully immersive multilingual experiences in both Arabic and English.

## Components

### 1. BilingualInput

A text input component that automatically detects the language of user input and stores translations for both languages.

```jsx
import BilingualInput from '../components/BilingualInput';

// In your component:
<BilingualInput
  name="title"
  label="Title"
  contentKey="unique_content_key"
  initialValue=""
  onChange={handleChange}
/>
```

### 2. BilingualTextarea

A multiline text input component for longer form content.

```jsx
import BilingualTextarea from '../components/BilingualTextarea';

// In your component:
<BilingualTextarea
  name="description"
  label="Description"
  contentKey="unique_description_key"
  initialValue=""
  onChange={handleChange}
  rows={4}
/>
```

### 3. BilingualContentDisplay

A component to display bilingual content with the ability to toggle between languages.

```jsx
import BilingualContentDisplay from '../components/BilingualContentDisplay';

// In your component:
<BilingualContentDisplay
  contentKey="unique_content_key"
  content="Fallback content if no stored bilingual content exists"
  variant="body1"
  component="p"
/>
```

### 4. MultilingualEditor

A rich text editor that supports editing content in both languages with automatic translation.

```jsx
import MultilingualEditor from '../components/MultilingualEditor';

// In your component:
<MultilingualEditor
  contentKey="unique_rich_content_key"
  initialValue=""
  onChange={handleChange}
  minHeight={300}
/>
```

## How It Works

1. **Language Detection**: The system automatically detects the language of user input.

2. **Storage**: When a user enters text in one language, it is automatically translated to the other language and both versions are stored.

3. **Display**: Content is displayed in the user's selected UI language, but can be toggled to view the alternate language version.

4. **Persistence**: Bilingual content is stored in local storage using the provided `contentKey` to maintain translations across sessions.

## Implementation Examples

### Form with Bilingual Inputs

```jsx
import React, { useState } from 'react';
import { Button } from '@mui/material';
import BilingualInput from '../components/BilingualInput';
import BilingualTextarea from '../components/BilingualTextarea';

const BilingualForm = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <BilingualInput
        name="title"
        label="Title"
        contentKey="form_title"
        required
      />
      
      <BilingualTextarea
        name="description"
        label="Description"
        contentKey="form_description"
        rows={4}
      />
      
      <Button type="submit" variant="contained">
        Submit
      </Button>
    </form>
  );
};
```

### Display Bilingual Content

```jsx
import React from 'react';
import { Typography, Box } from '@mui/material';
import BilingualContentDisplay from '../components/BilingualContentDisplay';

const ContentDisplay = ({ item }) => {
  return (
    <Box>
      <BilingualContentDisplay
        contentKey={`item_title_${item.id}`}
        content={item.title}
        variant="h5"
      />
      
      <BilingualContentDisplay
        contentKey={`item_desc_${item.id}`}
        content={item.description}
        variant="body1"
      />
    </Box>
  );
};
```

## Integration with Translation API

For a production environment, replace the mock translation in `translate-user-input.js` with an actual translation service API such as:

1. Google Cloud Translation API
2. Microsoft Azure Translator
3. DeepL API
4. Amazon Translate

Example implementation with Google Cloud Translation API:

```javascript
// In translate-user-input.js
import { TranslationServiceClient } from '@google-cloud/translate';

const translationClient = new TranslationServiceClient();

export const translateUserInput = async (text, targetLang) => {
  try {
    const request = {
      parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/global`,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode: sourceLang,
      targetLanguageCode: targetLang,
    };

    const [response] = await translationClient.translateText(request);
    return response.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
};
``` 