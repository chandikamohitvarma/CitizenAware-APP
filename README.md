# CitizenAware 2026 - Government Schemes App

Your Gateway to 180+ Government Schemes - 2026 Edition

A modern Expo React Native app for discovering and applying to government schemes and services.

## Features

- **180+ Government Schemes** - Latest 2026 schemes across 9 categories
- **AI-Powered Recommendations** - Personalized scheme suggestions
- **Real-time Notifications** - Stay updated on applications and deadlines
- **Document Management** - Easy upload and tracking
- **Application Tracking** - Monitor status from draft to approval
- **Saved Schemes** - Bookmark for quick access
- **Multi-language Support** - Available in 12+ languages
- **Secure Authentication** - Supabase-powered auth system

## Tech Stack

- **Frontend**: React Native + Expo Router
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **State**: Zustand
- **UI**: NativeWind (Tailwind CSS for React Native)
- **Icons**: Lucide React Native
- **Language**: TypeScript

## Prerequisites

Before running this app, ensure you have:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **npm** or **yarn** package manager
3. **Visual Studio Code** - [Download](https://code.visualstudio.com/)
4. **Expo CLI** (will be installed automatically)
5. **Git** - [Download](https://git-scm.com/)

## Getting Started in VS Code

### Step 1: Clone or Open the Project

```bash
# Navigate to the project directory
cd /tmp/cc-agent/67223971/project
```

Or open the folder directly in VS Code:
- Open VS Code
- File → Open Folder
- Select the project directory

### Step 2: Install Dependencies

Open the integrated terminal in VS Code:
- Press `` Ctrl + ` `` (backtick) or
- Terminal → New Terminal

Then run:

```bash
npm install
```

### Step 3: Configure Environment Variables

The `.env` file is already configured with Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://onfhebqztuzzkucbjnbk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**No additional configuration needed!**

### Step 4: Run the Development Server

```bash
npm run dev
```

This will start the Expo development server.

### Step 5: Open in Browser

After the server starts, you'll see options:

```
› Press a │ open Android
› Press w │ open web
› Press r │ reload app
› Press m │ toggle menu
```

Press **`w`** to open in your web browser.

Or visit: `http://localhost:8081`

## Available Scripts

```json
{
  "dev": "Start Expo development server",
  "build:web": "Build for web deployment",
  "typecheck": "Run TypeScript type checking",
  "lint": "Run ESLint"
}
```

## Project Structure

```
project/
├── app/                    # Expo Router pages (file-based routing)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── schemes.tsx    # All schemes
│   │   ├── notifications.tsx # Alerts
│   │   └── profile.tsx    # User profile
│   ├── auth/              # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── scheme/            # Scheme-related screens
│   │   ├── [id].tsx      # Scheme details
│   │   ├── all.tsx       # All schemes
│   │   ├── saved.tsx     # Saved schemes
│   │   └── categories.tsx
│   ├── apply/             # Application flow
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   └── ui/
├── constants/            # App constants
│   ├── colors.ts
│   └── data.ts
├── lib/                  # External services
│   └── supabase.ts       # Supabase client
├── store/                # State management (Zustand)
│   ├── authStore.ts
│   ├── schemeStore.ts
│   └── notificationStore.ts
├── types/                # TypeScript definitions
└── assets/               # Images, fonts, etc.
```

## Database Schema

The app uses Supabase PostgreSQL with Row Level Security (RLS):

### Tables

1. **schemes** - Government schemes (23 rows)
   - id, name, description, category
   - eligibility (JSONB)
   - documents_required (ARRAY)
   - featured, created_at

2. **applications** - User applications
   - id, user_id, scheme_id
   - status (draft/submitted/approved/rejected)
   - current_step, personal_data, address_data, bank_data

3. **saved_schemes** - User bookmarks
   - id, user_id, scheme_id, created_at

4. **notifications** - User alerts
   - id, user_id, title, message
   - type (success/warning/error/info)
   - read, created_at

## Authentication Flow

1. **Register**
   - Email, password, name, phone
   - Automatic login after registration
   - Data stored in Supabase Auth

2. **Login**
   - Email and password authentication
   - JWT token management
   - Session persistence

3. **Forgot Password**
   - Email-based password reset
   - Deep link to reset screen
   - 1-hour expiry

4. **Protected Routes**
   - All tabs require authentication
   - Redirect to login if not authenticated

## Features Overview

### Home Screen
- Featured 2026 schemes
- Quick stats (applied, approved, pending)
- AI recommendations card
- Real-time scheme updates

### Schemes Browser
- Search and filter by category
- 9 categories (Digital, Healthcare, Education, etc.)
- Scheme details with eligibility
- Save/bookmark functionality

### Application Flow
- Multi-step form (4 steps)
  1. Personal information
  2. Address details
  3. Bank information
  4. Document upload
- Progress tracking
- Status monitoring

### Notifications
- Real-time alerts (Supabase)
- 4 types: success, warning, error, info
- Read/unread filtering
- Mark all as read

### Profile
- User information display
- Quick stats (saved, applied, approved)
- Personal information editing
- Address management

## Supabase Integration

### Connection Details

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Row Level Security (RLS)

All tables have RLS enabled with policies:

```sql
-- Users can only read their own data
CREATE POLICY "Users can read own data"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

## VS Code Extensions (Recommended)

Install these extensions for the best experience:

1. **ES7+ React/Redux/React-Native snippets**
2. **TypeScript Importer**
3. **Prettier - Code formatter**
4. **ESLint**
5. **Thunder Client** (for API testing)
6. **SQLite Viewer** (database inspection)

## Troubleshooting

### Common Issues

**1. "Module not found" error**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

**2. "Unable to resolve module"**
```bash
# Clear Metro bundler cache
npm start -- --clear
```

**3. Environment variables not loading**
- Ensure `.env` file is in project root
- Variables must start with `EXPO_PUBLIC_`
- Restart the dev server

**4. Type errors**
```bash
# Run type checker
npm run typecheck
```

**5. Build errors**
```bash
# Check for dependency issues
npm audit
npm audit fix
```

## Building for Production

### Web Build

```bash
npm run build:web
```

Output will be in `dist/` folder.

### Mobile Build (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## API Endpoints

All data is fetched from Supabase tables:

```typescript
// Get all schemes
const { data } = await supabase
  .from('schemes')
  .select('*');

// Get user applications
const { data } = await supabase
  .from('applications')
  .select('*')
  .eq('user_id', user.id);

// Get notifications
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', user.id);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for your needs.

## Support

For issues or questions:
- Open a GitHub issue
- Check the troubleshooting section
- Review Supabase documentation

## Acknowledgments

- Expo team for the amazing framework
- Supabase for backend services
- Lucide for beautiful icons
- Government of India for scheme data

---

**Built with ❤️ for Digital India Initiative 2026**
