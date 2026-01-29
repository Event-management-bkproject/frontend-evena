# Internationalization (i18n) Guide

This project uses `react-i18next` for internationalization support.

## Current Languages

- 🇬🇧 English (en)
- 🇻🇳 Vietnamese (vi) - Default

## Usage

### In Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.buttons.login')}</h1>
      <p>{t('auth.login.title')}</p>
    </div>
  );
}
```

### With Dynamic Values

```tsx
const { t } = useTranslation();

// Simple interpolation
t('event.form.imagesAdded', { count: 5 }) // "5 images added"

// Multiple values
t('messages.success.invitationAccepted', { organizationName: 'Tech Corp' })
```

### Changing Language

```tsx
import { useTranslation } from 'react-i18next';

function LanguageButton() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <button onClick={() => changeLanguage('en')}>English</button>
  );
}
```

## Translation File Structure

```
src/i18n/
├── config.ts                      # i18n configuration
├── locales/
│   ├── en/
│   │   └── translation.json       # English translations
│   └── vi/
│       └── translation.json       # Vietnamese translations
└── README.md                      # This file
```

## Translation Keys Structure

```json
{
  "common": {
    "buttons": { "login": "Login", "logout": "Logout" },
    "labels": { "email": "Email", "password": "Password" },
    "navigation": { "home": "Home", "dashboard": "Dashboard" },
    "status": { "active": "Active", "pending": "Pending" }
  },
  "auth": {
    "login": { "title": "Login" },
    "register": { "customerTitle": "Customer Registration" }
  },
  "event": { ... },
  "organization": { ... },
  "member": { ... },
  "validation": { ... },
  "messages": {
    "success": { ... },
    "error": { ... }
  }
}
```

## Adding a New Language

1. Create a new directory in `src/i18n/locales/` (e.g., `fr/` for French)
2. Create `translation.json` file with all translation keys
3. Update `src/i18n/config.ts`:

```typescript
import frTranslation from './locales/fr/translation.json';

const resources = {
  en: { translation: enTranslation },
  vi: { translation: viTranslation },
  fr: { translation: frTranslation }, // Add new language
};
```

4. Update `src/components/LanguageSwitcher/LanguageSwitcher.tsx`:

```typescript
const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'fr', name: 'French', nativeName: 'Français' }, // Add new language
];
```

## Best Practices

1. **Use Semantic Keys**: Use descriptive keys like `auth.login.title` instead of `login_title`
2. **Group by Feature**: Organize translations by feature/module
3. **Avoid Hardcoded Text**: Always use translation keys, never hardcode text
4. **Keep Translations Consistent**: Use the same terminology across all languages
5. **Handle Plurals**: Use i18n pluralization for countable items

## Language Detection

The system automatically detects user language in this order:
1. User's saved preference (localStorage)
2. Browser language
3. Default fallback (Vietnamese)

Language preference is saved automatically in `localStorage` when changed.

## Language Switcher

Users can change language by:
1. Clicking the Settings icon in the Dashboard Header
2. Selecting their preferred language from the modal
3. The change is applied immediately and saved to localStorage
