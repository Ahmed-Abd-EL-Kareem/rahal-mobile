# Rahal Mobile App — Implementation Plan

Source: `rahal-mobile` (Expo React Native, SDK 57)
Companion doc: `rahal-backend-updates-plan.md` (small backend-side change needed for #6).

All 6 issues were confirmed directly against the current code in the repo — nothing here is speculative. Root cause is called out for each before the fix.

---

## Findings summary

| # | Issue | Root cause found in code |
|---|---|---|
| 1 | Google login → "missing client id" | `src/hooks/useGoogleAuth.ts` reads `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` / `_IOS_CLIENT_ID` / `_WEB_CLIENT_ID`, all defaulting to `''`. None of these exist in `.env` / `.env.example` / EAS secrets. Backend endpoint (`POST /auth/google/mobile`) is already implemented and working — this is purely a missing-config problem. |
| 2 | Wrong app icon | `app.json` already correctly points `icon` / `android.adaptiveIcon.foregroundImage` / `web.favicon` at `./src/assets/logo-2.png` (which doesn't even exist — the real file is at `./assets/logo-2.png`, one level up). **But that almost doesn't matter**, because the repo has a **committed native `android/` folder** with static `ic_launcher.webp` files per density and `AndroidManifest.xml` hard-wired to `@mipmap/ic_launcher`. EAS Build uses that native project as-is; `app.json`'s icon config is ignored entirely for native Android/iOS builds once a native folder exists. |
| 3 | Login doesn't persist across app restarts | `react-native-mmkv@4.3.2` is a listed dependency but is **never imported anywhere in the codebase**. `src/store/mmkvStore.ts` is a hand-written fake: it wraps `@react-native-async-storage/async-storage` with an in-memory `Map` cache, populated by `initCache()` — which is `async` and fire-and-forget. Zustand's `persist` middleware reads from this cache synchronously on store creation, which can run **before** `initCache()` finishes reading from `AsyncStorage`, silently losing the rehydrated session. |
| 4 | Splash screen should show logo-2.png on primary color | `app.json` splash is already set to `logo-2.png`, but `backgroundColor: "#FCF9F4"` is your **background** token (`colors.light.background`), not `primary` (`#5F4100` light / `#F8BC51` dark). Also, exactly like #2, the native `android/app/src/main/res/values/colors.xml` hardcodes `splashscreen_background` to `#FFFFFF` — completely disconnected from `app.json`, so the native splash won't match either config until it's regenerated. |
| 5 | Lists only show 10 items, no way to load more | The data layer is already correct: `useHotels`, `useDestinations`, `useTrips`, `useBookings` (in `src/api/hooks/`) all use `useInfiniteQuery` and expose `fetchNextPage` / `hasNextPage` / `isFetchingNextPage`. The screens (`app/(tabs)/explore.tsx`, `hotel.tsx`, `trips.tsx`) destructure those values but **never call `fetchNextPage()` anywhere** and render into a plain `ScrollView` with no `onEndReached` handler or "Load more" button. |
| 6 | AI features don't work on mobile | `src/hooks/useAIChat.ts` (used by the AI tab, `app/(tabs)/ai.tsx`) POSTs `{ messages: [...] }` to `ai/chat`. The backend controller expects `{ message, sessionId }` (singular) and throws `400 "message is required"` on every call, since `req.body.message` is always `undefined`. The other two AI hooks (`useAIHotelSearch`, `useAIBookingConversation`) already send the correct shape and should already work. |

---

## Phase 1 — Google Sign-In config (~30–45 min)

Backend is done (per `rahal-backend-updates-plan.md` / earlier work — `POST /auth/google/mobile` already exists and works). This is 100% a client-config gap.

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), under the **same project** already used for the web OAuth client:
   - Create an **Android** OAuth client ID (needs your package name `com.rahal.mobile` + SHA-1 fingerprint — get it from `eas credentials` or your keystore).
   - Create an **iOS** OAuth client ID (needs bundle ID `com.rahal.mobile`).
   - You already have a **Web** OAuth client ID (used server-side as `GOOGLE_CLIENT_ID`) — reuse it as the `webClientId` value below; it's required by `expo-auth-session` even on native platforms for the ID-token flow.
2. Add to `.env` (and to EAS secrets for cloud builds — `eas secret:create`):
   ```
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxxxx.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxxxx.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxxx.apps.googleusercontent.com
   ```
3. Add the same 3 keys to `.env.example` (with placeholder values) so this doesn't silently break again for the next environment.
4. Rebuild with EAS (env vars baked at build time) — a plain Expo Go reload won't pick up new `EXPO_PUBLIC_*` values if you're using a dev client; a fresh `eas build --profile preview` will.

**Acceptance:** tapping "Continue with Google" opens the native account picker (no more "missing client id"), and completes sign-in via the existing `/auth/google/mobile` flow.

---

## Phase 2 — Fix the actual persistent-login bug (~2–3 hours)

Replace the fake `mmkvStore.ts` with the real `react-native-mmkv` package that's already a dependency.

### 2.1 Rewrite `src/store/mmkvStore.ts`

```ts
// src/store/mmkvStore.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'rahal-storage' });

export const useMMKVStore = {
  getState: () => ({
    getString: (key: string) => storage.getString(key),
    setString: (key: string, value: string) => storage.set(key, value),
    delete: (key: string) => storage.delete(key),
    getAllKeys: () => storage.getAllKeys(),
    clearAll: () => storage.clearAll(),
  }),
};
```

This is truly synchronous (native JSI binding, no `AsyncStorage` round-trip, no cache-population race), which is exactly what Zustand's `persist` middleware needs to rehydrate reliably before first render.

### 2.2 No changes needed in `authStore.ts`

It already calls `useMMKVStore.getState().getString/setString/delete` through the same interface — swapping the implementation underneath is a drop-in replacement.

### 2.3 Also worth doing while you're in there: persist the token itself

Right now `authStore`'s `partialize` persists `{ user, subscription, isAuthenticated }` but not `token` — the real token only lives in `expo-secure-store` via `api/client.ts`, and `checkAuth()` re-fetches `/users/me` on every cold start to re-validate it. That's actually a reasonable pattern security-wise (keeps the JWT out of the Zustand JSON blob), so **no change required** here — just confirm after 2.1 that `checkAuth()` (called in `app/_layout.tsx`) reliably finds the token in `expo-secure-store` and restores the session without hitting the onboarding screen.

### 2.4 Test plan

- Log in → force-close the app (not just background) → reopen → should land on `(tabs)`, not onboarding/login.
- Repeat after a full device reboot (SecureStore/Keychain edge case).
- Repeat immediately after a fresh EAS install (first-ever launch) to confirm no crash from `MMKV` construction timing.

**Acceptance:** app stays logged in across force-close + reopen, like the Facebook-style behavior you described — no bogus re-login prompt.

---

## Phase 3 — App icon (~1–2 hours, requires a rebuild)

Because a native `android/` folder is committed, `app.json` alone won't fix this. Two options:

**Option A — regenerate native projects from `app.json` (recommended, cleanest):**
```bash
# fix the broken path first
```
Then in `app.json`, change every reference from `./src/assets/logo-2.png` to `./assets/logo-2.png` (the file that actually exists), for: `icon`, `android.adaptiveIcon.foregroundImage`, `web.favicon`, and `splash.image`. Then:
```bash
npx expo prebuild --clean
```
This regenerates `android/` and `ios/` from `app.json`, replacing the stale `ic_launcher.webp` files and updating `AndroidManifest.xml`/`Info.plist` automatically. **Caveat:** if any manual native-code changes were made inside `android/` or `ios/` for Stripe/Mapbox/MMKV linking that aren't captured by config plugins, `--clean` will wipe them — check `android/app/build.gradle` and `MainApplication.kt`/`MainActivity.kt` against git history before running this, and re-apply anything custom.

**Option B — patch the native folder directly (faster, no risk of losing native tweaks):**
Manually regenerate `ic_launcher.png`/`.webp` at each density (mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi) from `logo-2.png` (a tool like [Expo's icon generator](https://docs.expo.dev/versions/v57.0.0/config/app/#icon) or `npx @expo/image-utils` can do this) and drop them into the matching `android/app/src/main/res/mipmap-*/` folders, replacing the existing files. Also update the equivalent iOS `AppIcon.appiconset` images under `ios/rahalmobile/Images.xcassets/`.

Either way, this needs a **new native build** (`eas build --profile preview --platform android`) — an OTA/JS-only update will not change the icon.

**Acceptance:** the icon on the home screen (launcher) is `logo-2.png`, not the default Expo/React icon.

---

## Phase 4 — Splash screen: logo on primary color (~1 hour, same rebuild as Phase 3)

1. In `app.json`, change:
   ```diff
   "splash": {
     "image": "./assets/logo-2.png",
     "resizeMode": "contain",
   -  "backgroundColor": "#FCF9F4"
   +  "backgroundColor": "#5F4100"
   }
   ```
   (`#5F4100` is `colors.light.primary` from `src/constants/colors.ts`. If you want the splash to also respect dark mode, note Expo's static splash config only supports one color — a dark-mode-aware splash needs `expo-splash-screen`'s programmatic API instead, which is a bigger lift; recommend sticking with the single light-primary color for now unless dark mode is a priority.)
2. Update `android/app/src/main/res/values/colors.xml`:
   ```diff
   - <color name="splashscreen_background">#FFFFFF</color>
   + <color name="splashscreen_background">#5F4100</color>
   ```
3. Regenerate the splash image asset the same way as Phase 3 (Option A's `prebuild --clean` handles both icon and splash in one pass — recommended to do Phases 3 and 4 together as a single rebuild).

**Acceptance:** on cold launch, before JS loads, the user sees `logo-2.png` centered on a `#5F4100` (primary/gold-brown) background — on both a fresh install and subsequent launches.

---

## Phase 5 — "Load more" for destinations, hotels, trips, bookings (~3–4 hours)

No new hooks needed — wire up what already exists. Recommended approach: **switch each list from `ScrollView` + `.map()` to `FlatList`** with `onEndReached`, which is the standard, most "modern" pattern for mobile (auto-loads as the user scrolls, no extra tap needed) — but a footer "Load more" button is also acceptable if you'd rather keep explicit user control. Going with `FlatList` + `onEndReached` below since it matches what "modern apps" (Instagram, Airbnb, etc.) do.

### 5.1 Pattern to apply in `explore.tsx`, `hotel.tsx`, `trips.tsx`

```tsx
<FlatList
  data={destinations}                 // apiDestinationsResponse?.pages.flatMap(p => p.data)
  keyExtractor={(item) => item._id}
  renderItem={({ item }) => <DestinationCard destination={item} />}
  onEndReached={() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }}
  onEndReachedThreshold={0.5}
  ListFooterComponent={
    isFetchingNextPage ? <ActivityIndicator size="small" color={colors.primary} style={{ paddingVertical: 20 }} /> : null
  }
  refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
  contentContainerStyle={{ paddingBottom: 100 }}
  showsVerticalScrollIndicator={false}
/>
```

- `explore.tsx`: replace the destinations `ScrollView`/`.map()` block with the `FlatList` above, reusing `apiDestinationsResponse`, `fetchNextPage`, `hasNextPage`, `isFetchingNextPage` (already destructured at line 89 — just unused until now).
- `hotel.tsx`: same pattern using `hotelsResponse`, `fetchNextPage`, `hasNextPage`, `isFetchingNextPage` (already destructured at line 35).
- `trips.tsx`: **two separate lists** on one screen (trips + bookings) — if using tabs/sections, give each its own `FlatList` with its own `onEndReached` calling `fetchNextTripsPage()` / `fetchNextBookingsPage()` respectively (both already destructured at lines 27–28).
- If any of these screens currently rely on other content living inside the same outer `ScrollView` (headers, filter chips, banners), move that content into `ListHeaderComponent` on the `FlatList` rather than wrapping the `FlatList` in another scroll container — nesting a `FlatList` inside a `ScrollView` breaks its virtualization and defeats the purpose of switching to `FlatList` in the first place.

### 5.2 If you'd rather have an explicit button instead of auto-scroll-load

Swap the `FlatList` props above for a plain footer button instead of `onEndReached`:
```tsx
ListFooterComponent={
  hasNextPage ? (
    <TouchableOpacity onPress={() => fetchNextPage()} disabled={isFetchingNextPage} className="py-4 items-center">
      {isFetchingNextPage ? <ActivityIndicator color={colors.primary} /> : <Text style={{ color: colors.primary }}>Load more</Text>}
    </TouchableOpacity>
  ) : null
}
```

**Acceptance:** scrolling to the bottom of destinations/hotels/trips/bookings loads the next page seamlessly (or via a tappable "Load more"), instead of stopping dead at item 10–12.

---

## Phase 6 — Fix the AI chat request shape (~15 min, mobile-only change)

`src/hooks/useAIChat.ts`, inside `sendMessage`, currently does:
```ts
const response = await api.post('ai/chat', {
  json: { messages: [...messages, { role: 'user', content }] },
}).json<SuccessResponse<AIChatResponse>>();
```

Change it to match what the backend actually expects (`{ message, sessionId }`) — the backend manages conversation history server-side per `sessionId`, so you don't need to resend the full message array at all:

```ts
const response = await api.post('ai/chat', {
  json: { message: content, sessionId: chatId },
}).json<SuccessResponse<AIChatResponse>>();
```

Double check `AIChatResponse`'s shape in `src/types/api.ts` matches what `ai.controller.js`'s `chat` handler actually returns (it returns `result` from `aiService.chat(...)`, which — per the controller — includes a `messages` array server-side, not just `{ reply, tokensUsed }`; confirm the field you read the assistant's reply from, e.g. `response.data.reply` vs pulling the last item out of `response.data.messages`, matches the real response body once you test against a live call).

**Acceptance:** sending a message in the AI chat tab gets a real reply instead of a silent failure / 400.

---

## Suggested order & rough timeline

| Phase | Focus | Est. |
|---|---|---|
| 1 | Google Sign-In env config | 30–45 min |
| 2 | Real MMKV → fixes persistent login | 2–3 hours |
| 3 | App icon (native rebuild) | 1–2 hours |
| 4 | Splash screen (same rebuild as #3) | 1 hour |
| 5 | Load-more pagination UI (4 screens) | 3–4 hours |
| 6 | AI chat request-shape fix | 15 min |

Total: roughly 1–1.5 days of focused mobile work. Do Phases 3+4 together (one rebuild covers both), and do Phase 6 alongside the backend's optional Phase 1 change in the companion doc (they're the same conversation, just two sides of one contract).
