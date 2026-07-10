# Rahal AI Travel App - React Native (Expo)

A production-ready React Native mobile app for AI-powered travel planning in Egypt, built with Expo Router, NativeWind (Tailwind CSS), and a comprehensive backend API.

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Expo Router v4 (React Native) |
| **Styling** | NativeWind v4 (Tailwind CSS) |
| **State Management** | Zustand (client) + TanStack Query v5 (server) |
| **API Client** | Ky with interceptors |
| **Navigation** | Expo Router (file-based) |
| **Forms** | React Hook Form + Zod |
| **Internationalization** | i18next (EN/AR with RTL) |
| **Maps** | MapLibre GL + OpenStreetMap (free) |
| **Payments** | Stripe React Native SDK |
| **Analytics** | PostHog |
| **Auth Storage** | MMKV + SecureStore |
| **Testing** | Vitest + React Native Testing Library + Maestro E2E |
| **CI/CD** | GitHub Actions + EAS Build |

## 🎨 Design System

Based on the **Rahal Heritage Modern** design system from Stitch:

- **Colors**: Sand/Obsidian themes with Pharaoh Gold, Nile Blue, Papyrus Green, Hieroglyph Red
- **Typography**: Playfair Display (headlines) + Inter (body) — Arabic: Noto Naskh + Cairo
- **Spacing**: 4px base unit, 24px gutter, 16px mobile margins
- **Shapes**: 16px cards, full-pill CTAs, 8px inputs, asymmetric AI bubbles
- **RTL**: Full support via logical properties

## 📱 Screens (19 from Stitch)

| Screen | Route | Key Features |
|--------|-------|--------------|
| Splash/Onboarding | `/(onboarding)` | 3-4 slides, first-launch detection |
| Login | `/(auth)/login` | Email/password + Google OAuth |
| Sign Up | `/(auth)/signup` | Name, email, password, terms |
| Forgot Password | `/(auth)/forgot-password` | Email → OTP → Reset |
| Home Dashboard | `/(tabs)` | Hero, search, destinations, hotels, AI chat, pricing |
| Explore Destinations | `/(tabs)/explore` | Filters, grid/map view, AI chat CTA |
| AI Concierge Chat | `/(tabs)/ai` | Chat, suggestions, trip generation |
| Hotels Search | `/hotel/[id]` | Filters, AI search, map view |
| Hotel Detail | `/hotel/[id]` | Rooms, amenities, booking, AI insights |
| Destination Detail | `/destination/[slug]` | Attractions, best time, hotels, plan trip |
| AI Trip Itinerary | `/trip/[id]` | Day-by-day, activities, meals, costs |
| Trip Generation | `/trip/generate` | AI-powered custom itineraries |
| Booking Flow | `/booking/flow` | AI or direct booking, Stripe |
| Booking Detail | `/booking/[id]` | Status, payment, policies, AI insights |
| My Trips | `/(tabs)/trips` | Upcoming/past trips, bookings |
| Profile & Settings | `/(tabs)/profile` | Account, subscription, preferences |
| Favorites | `/favorites` | Saved hotels & destinations |
| Subscriptions | `/subscription/plans` | Plans, upgrade, Stripe Checkout |
| Account | `/settings/account` | Profile, security, notifications |

## 🔌 Backend API

**Base URL**: `https://rahal-back-end.vercel.app/api/v1`

Key endpoints organized by domain:

- **Auth**: `/auth/*` (signup, login, Google OAuth, OTP, password reset)
- **Users**: `/users/*` (profile, preferences, password change)
- **Destinations**: `/destinations/*` (list, search, nearby, trending, slug)
- **Hotels**: `/hotels/*` (list, search, meta, nearby, slug)
- **Trips**: `/trips/*` (CRUD, AI generation, stats)
- **Bookings**: `/bookings/*` (CRUD, cancel, payment)
- **AI**: `/ai/*` (chat, hotel search, recommendations, booking conversation)
- **Subscriptions**: `/subscriptions/*` (plans, my subscription, upgrade, Stripe)
- **Payments**: `/payments/booking/*` (Stripe Checkout, status)

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- iOS Simulator / Android Emulator

### Installation

```bash
# Clone and install
cd rahal-mobile
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env
# Edit .env with your keys

# Start development
npm start
# Press 'i' for iOS, 'a' for Android, 'w' for web
```

### Development Commands

```bash
# Start dev server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint

# Unit tests
npm run test:unit

# E2E tests (requires Maestro)
maestro test maestro/flows/

# Build for preview
eas build --profile preview

# Build for production
eas build --profile production

# Submit to stores
eas submit --profile production
```

## 🏗️ Project Structure

```
rahal-mobile/
├── app/                    # Expo Router file-based routing
│   ├── _layout.tsx         # Root providers (Query, Auth, Theme, I18n, PostHog)
│   ├── (auth)/             # Auth stack (login, signup, forgot, OTP, reset)
│   ├── (onboarding)/       # Splash/onboarding
│   ├── (tabs)/             # Main tab navigator (5 tabs)
│   │   ├── _layout.tsx     # Tab navigator config
│   │   ├── index.tsx       # Home Dashboard
│   │   ├── explore.tsx     # Explore Destinations
│   │   ├── ai.tsx          # AI Concierge Chat
│   │   ├── trips.tsx       # My Trips & Bookings
│   │   └── profile.tsx     # Profile & Settings
│   ├── hotel/[id].tsx      # Hotel Detail
│   ├── destination/[slug].tsx
│   ├── booking/[id].tsx
│   ├── booking/flow.tsx
│   ├── trip/[id].tsx
│   ├── trip/generate.tsx
│   ├── subscription/plans.tsx
│   ├── favorites.tsx
│   └── settings/*.tsx
├── src/
│   ├── api/                # API layer
│   │   ├── client.ts       # Ky instance with auth interceptors
│   │   ├── queryKeys.ts    # TanStack Query key factory
│   │   ├── queryClient.ts  # QueryClient config
│   │   └── hooks/          # Domain-specific hooks
│   │       ├── useAuth.ts
│   │       ├── useDestinations.ts
│   │       ├── useHotels.ts
│   │       ├── useTrips.ts
│   │       ├── useBookings.ts
│   │       ├── useSubscriptions.ts
│   │       └── useAI.ts
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Design system primitives
│   │   ├── layout/         # Layout components (HeroHeader, etc.)
│   │   ├── forms/          # Form components
│   │   ├── chat/           # AI Chat components
│   │   ├── booking/        # Booking components
│   │   ├── trip/           # Trip components
│   │   ├── hotel/          # Hotel components
│   │   └── destination/    # Destination components
│   ├── constants/          # Design tokens
│   │   ├── colors.ts       # Light/dark color tokens
│   │   ├── typography.ts   # Font families, sizes, line heights
│   │   ├── spacing.ts      # Spacing scale
│   │   ├── shapes.ts       # Border radius, shadows
│   │   └── theme.ts        # NativeWind config
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand stores
│   │   ├── authStore.ts    # Auth state + persistence
│   │   ├── uiStore.ts      # Modals, toasts, RTL
│   │   └── aiSessionStore.ts # AI chat sessions
│   ├── types/              # TypeScript types
│   │   ├── api.ts          # API response types
│   │   └── navigation.ts   # Expo Router param types
│   ├── utils/              # Utilities
│   │   ├── date.ts         # date-fns helpers
│   │   ├── currency.ts     # EGP/USD formatting
│   │   ├── rtl.ts          # RTL helpers
│   │   ├── map.ts          # MapLibre config
│   │   └── validation.ts   # Zod schemas
│   ├── i18n/               # Internationalization
│   │   ├── index.ts        # i18next config
│   │   ├── en.json         # English translations
│   │   └── ar.json         # Arabic translations
│   └── assets/             # Fonts, images, map styles
├── maestro/                # E2E test flows
├── .github/workflows/      # CI/CD pipelines
├── eas.json                # EAS Build config
├── tailwind.config.js      # Tailwind config
├── babel.config.js         # Babel with NativeWind + Reanimated
└── tsconfig.json           # TypeScript config
```

## 🌍 Internationalization

- **Languages**: English (default) + Arabic (RTL)
- **Files**: `src/i18n/en.json`, `src/i18n/ar.json`
- **RTL**: Automatic via `useRTL()` hook, logical CSS properties
- **Fonts**: Playfair Display + Inter (EN), Noto Naskh Arabic + Cairo (AR)

## 🧪 Testing

### Unit Tests (Vitest + RTL)

```bash
npm run test:unit
```

### E2E Tests (Maestro)

```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Run flows
maestro test maestro/flows/
```

Key flows: `login.yaml`, `signup.yaml`, `ai-chat.yaml`, `booking-flow.yaml`, `trip-generation.yaml`

## 📦 Build & Deploy

### EAS Build Profiles

| Profile | Use Case |
|---------|----------|
| `development` | Dev client, internal testing |
| `preview` | Internal QA, TestFlight/Play Internal |
| `production` | App Store / Play Store |

```bash
# Preview build
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --profile production
```

### OTA Updates

```bash
# Publish update
eas update --branch production --message "Bug fixes and improvements"
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_API_URL` | Backend API base URL | Yes |
| `EXPO_PUBLIC_POSTHOG_KEY` | PostHog project key | No |
| `EXPO_PUBLIC_POSTHOG_HOST` | PostHog host | No |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes (for payments) |
| `EXPO_PUBLIC_MAP_STYLE_URL` | MapLibre style URL | No |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry DSN | No |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Stitch** for the Heritage Modern design system
- **Expo** for the amazing React Native platform
- **NativeWind** for bringing Tailwind to React Native
- **OpenStreetMap** for free map tiles
- **Egypt's Ministry of Tourism** for inspiration

---

Built with ❤️ for travelers exploring the land of Pharaohs.