# Rahal Mobile — Bug Fix Plan

Repo: `rahal-mobile` (Expo SDK 57, expo-router)
Backend: `rahal-back-end.vercel.app/api/v1` (Node/Express on Vercel)

This document lists 6 issues found during testing, with root-cause hypotheses and concrete fix instructions. Work through them in order — items 1 and 5 are related (same asset), items 3 and 4 are backend/contract issues that need both sides checked.

**Update after retest:** Issues #1/#5 (splash + icon) and #4 (AI chat) are still not fixed. See the "Retest notes" callouts inside each section below for what to check next. A new issue, #6 (Google Sign-In blocked), has also been added.

---

## 1. Splash screen shows default Android robot icon + white screen instead of app logo

**Symptom:** On cold start, the app briefly shows a plain white screen with a generic Android/Expo placeholder icon instead of the branded splash.

**Root cause:** `app.json` / `app.config.js` either has no `splash` / `expo-splash-screen` config pointing at the real logo, or points at a missing/incorrectly-referenced asset path.

**Fix:**
- Locate the logo asset: `assets/logo-2.png` (confirm exact path/casing in the repo — check `assets/` root vs `assets/images/`).
- In `app.json`, under the `expo` key, configure the splash plugin (SDK 57 uses the `expo-splash-screen` config plugin, not the legacy top-level `splash` key):
  ```json
  {
    "expo": {
      "plugins": [
        [
          "expo-splash-screen",
          {
            "image": "./assets/logo-2.png",
            "imageWidth": 200,
            "resizeMode": "contain",
            "backgroundColor": "#<PRIMARY_COLOR_HEX>",
            "dark": {
              "image": "./assets/logo-2.png",
              "backgroundColor": "#<PRIMARY_COLOR_HEX>"
            }
          }
        ]
      ]
    }
  }
  ```
- Replace `<PRIMARY_COLOR_HEX>` with the app's actual primary brand color (check `constants/Colors.ts` or theme file — the gold/amber color used throughout the UI, e.g. `#C9962C`-ish — confirm exact hex from the theme constants, don't guess).
- If `expo-splash-screen` package isn't already a dependency, add it: `npx expo install expo-splash-screen`.
- Also make sure `app/_layout.tsx` (or wherever the root layout is) calls `SplashScreen.preventAutoHideAsync()` on mount and `SplashScreen.hideAsync()` once fonts/assets are ready — a missing `hideAsync()` call can cause a flash of blank white screen even with correct splash config.
- After changing `app.json`, this requires a **new native build** (`eas build`) — splash/icon config changes are not picked up by just reloading JS, since they're baked into native resources.

> **Retest notes (still broken):** if a rebuild has already been done and the default icon/splash still show, check these in order before touching config again:
> 1. **Confirm the config actually landed in the built app**: run `npx expo config --type public` (or inspect the generated `android/app/src/main/res/` after `expo prebuild`) and verify `logo-2.png` is actually referenced — a typo'd path or wrong key silently falls back to Expo's default assets without erroring.
> 2. **Confirm this project has a native `android/` folder checked in** (it does — the earlier Gradle build logs show `android/app/build.gradle` being edited directly). If there's a committed native `android/` directory, **`app.json`'s `icon`/`splash`/`android.adaptiveIcon` keys are ignored entirely** unless you run `npx expo prebuild --clean` to regenerate native folders from the config, or run `eas build` with the `expo-splash-screen`/icon config plugins actively syncing on each prebuild. Since this project has a manually-edited native project (custom `build.gradle`, Mapbox config, etc.), a bare `expo prebuild` may be dangerous — instead:
>    - Manually replace the actual icon files under `android/app/src/main/res/mipmap-*/ic_launcher*.png` (and `mipmap-anydpi-v26/ic_launcher.xml` foreground/background if adaptive) with exports of `logo-2.png` at each required density (mdpi 48px, hdpi 72px, xhdpi 96px, xxhdpi 144px, xxxhdpi 192px), OR
>    - Use `npx expo-splash-screen`/an icon-generation tool (e.g. `npx @expo/image-utils` or an online adaptive-icon generator) to produce the full mipmap set from `logo-2.png`, then commit those directly into `android/app/src/main/res/`.
>    - For splash specifically with a bare/native `android` folder: check `android/app/src/main/res/drawable/splashscreen_logo.png` (or similarly named) and `android/app/src/main/res/values/styles.xml` — these are the actual files controlling what's shown, and they may still reference the old placeholder if `expo-splash-screen`'s config plugin never ran against this native folder.
> 3. Confirm the EAS build actually used `--clear-cache` or the metro/gradle build wasn't just re-using a stale cached native build — try `eas build --profile preview --platform android --clear-cache`.
> 4. As a final sanity check, `unzip -l` the downloaded APK/AAB and confirm `res/mipmap-xxxhdpi/ic_launcher.png` inside the archive is actually the new logo bytes, not the old one — this proves definitively whether the build picked up the change.

---

## 2. "Destinations" screen — top title/heading text is cut off / rendered outside the screen

**Symptom:** On the Destinations tab (screenshot shows partially cut-off text near "Temples / Museums / Oases / All" filter row and page title area), some text overflows the visible screen bounds (visible in Image 3 — text appears clipped on the left edge, e.g. "...ds" for what's likely "Landmarks" or similar tab overflowing left of screen).

**Root cause:** Likely a horizontal `ScrollView`/`FlatList` of filter chips that isn't properly padded/starts scrolled to a non-zero offset, OR a `Text` component inside a fixed-width container without `flexShrink`/`numberOfLines`/`flexWrap`, causing overflow past screen edges.

**Fix:**
- Find the Destinations screen component (likely `app/(tabs)/destinations.tsx` or similar path — check `app/(tabs)/` directory).
- For the filter chips row (Landmarks / Temples / Museums / Oases / All):
  - Confirm it's wrapped in `<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>` — if `contentContainerStyle` padding is missing or the ScrollView isn't reset to `contentOffset: {x: 0}` on mount, the first chip can render partially off-screen.
  - Ensure the parent container has `overflow: 'hidden'` removed if it's clipping, or add `paddingLeft` matching the screen's horizontal margin.
- For any heading/title `Text` near the top of the screen:
  - Check for a fixed `width` or `maxWidth` style that's smaller than the actual rendered text at certain font scale / device widths — replace with `flex: 1` or `width: '100%'` and add `flexShrink: 1`.
  - If the text is meant to truncate, add `numberOfLines={1} ellipsizeMode="tail"`; if it's meant to wrap, add `flexWrap: 'wrap'` to the container and remove any `whiteSpace`/`nowrap`-equivalent constraint.
- Test at multiple device widths (iPhone SE small width, and larger phones) to confirm the fix isn't just fixing it for one screen size.

---

## 3. Destinations / Hotels / Bookings / Trips lists only ever show 10 items (pagination not working)

**Symptom:** Every list screen appears capped at 10 items regardless of how many actually exist in the backend. Backend logs show `GET /api/v1/trips?page=2&limit=10` being called — so pagination requests ARE going out, but the mobile app isn't using the results correctly (or isn't triggering "load more").

**Root cause (mobile side):** Almost certainly the list component (`FlatList`) is missing (or has a broken) `onEndReached` handler to fetch the next page, OR the fetched pages are being fetched but not appended to existing state (e.g. `setData(response.data)` instead of `setData(prev => [...prev, ...response.data])`), OR the API hook only ever requests `page=1` because a `page` state variable isn't being incremented.

**Fix — mobile:**
- Locate the data-fetching logic for each of these 4 screens. Likely candidates: `hooks/useTrips.ts`, `hooks/useHotels.ts`, `hooks/useBookings.ts`, `hooks/useDestinations.ts`, or equivalent API service files under `services/` or `api/`.
- For each list:
  1. Confirm there's a `page` state that increments (e.g. `const [page, setPage] = useState(1)`).
  2. Confirm the `FlatList` has:
     ```jsx
     <FlatList
       data={items}
       onEndReached={loadMore}
       onEndReachedThreshold={0.5}
       ListFooterComponent={isLoadingMore ? <ActivityIndicator /> : null}
     />
     ```
  3. Confirm `loadMore` actually increments `page` AND appends new results to existing state rather than replacing it:
     ```js
     const loadMore = () => {
       if (isLoadingMore || !hasNextPage) return;
       setPage(prev => prev + 1);
     };

     useEffect(() => {
       fetchPage(page).then(res => {
         setItems(prev => page === 1 ? res.data : [...prev, ...res.data]);
         setHasNextPage(res.data.length === LIMIT); // or use res.meta.hasNextPage if backend returns it
       });
     }, [page]);
     ```
  4. Confirm `hasNextPage` / `totalPages` logic is checking the correct field returned by the backend response shape (check what `/api/v1/trips` actually returns — likely something like `{ data: [...], meta: { page, limit, total, totalPages } }`). If the mobile code checks the wrong field name, `hasNextPage` will always evaluate false/true incorrectly.
- **Double-check `limit`**: if the app always sends `limit=10` and never increases it, and the user expects "all items" rather than infinite-scroll pagination, consider whether the intended UX is (a) infinite scroll (fix per above) or (b) a genuinely higher limit / "load all" request. Confirm with product intent — if it should just fetch everything at once for small lists (e.g. under ~100 items), consider bumping `limit` to a higher number (e.g. 100) instead of paginating, but infinite scroll is generally the better pattern for larger datasets.

**Fix — backend (verify, don't assume mobile-only bug):**
- Check the Express route handlers (`routes/trips.js`, `routes/hotels.js`, `routes/bookings.js`, `routes/destinations.js` or equivalent controllers) to confirm:
  - `page` and `limit` query params are actually respected (not hardcoded).
  - The response includes pagination metadata (`total`, `totalPages`, or `hasMore`) so the mobile app can know when to stop requesting more pages.
- If the backend response doesn't include a total count, add one — the mobile app can't reliably know when to stop paginating without it.

---

## 4. AI Chat (Rahal Chat) — backend returns 200 success but chat UI shows empty response or "Failed to send message"

**Symptom:** Vercel logs show `POST /api/v1/ai/chat` → `200` with real response times (13–25 seconds, consistent with an LLM call), but the mobile UI either shows nothing or "Failed to send message" (see Image 4). Also noted: `[ERROR] [AIUsage] Failed to create log for feature "tripGeneration"` appears in logs around a related trip-generation call.

**Root cause hypotheses (check all):**
1. **Response shape mismatch**: the backend returns 200 but the JSON body's shape doesn't match what the mobile client expects to parse (e.g. backend returns `{ reply: "..." }` but mobile code reads `response.data.message`). This would produce a 200 status but an effectively "empty" parsed response in the UI.
2. **Timeout on the client side**: the AI call takes 13–25 seconds per the logs. If the mobile HTTP client (axios/fetch) has a timeout shorter than that (e.g. a default 10s or 15s timeout), the client will treat the request as failed even though the backend eventually returns 200 — this matches "Failed to send message" appearing.
3. **AIUsage logging failure may be swallowing/short-circuiting the real response**: the `[ERROR] [AIUsage] Failed to create log for feature "tripGeneration"` suggests a secondary DB write (usage/analytics logging) is failing after the AI response is generated — if this logging call is awaited before the response is sent to the client (rather than fire-and-forget), an error there could cause the request to hang or return malformed data even though a 200 was logged for the outer request.

**Fix:**
- **Backend (`routes/ai.js` or `controllers/aiController.js` and wherever `AIUsage` logging lives, likely `services/aiUsageService.js`):**
  - Make the `AIUsage` log-write **non-blocking**: wrap it in a `try/catch` and don't `await` it in the critical path before sending the response, or use `.catch(err => logger.error(...))` without blocking the response send. A failing analytics write should never affect the actual chat response.
  - Confirm the exact JSON shape returned by `/api/v1/ai/chat` on success — log/print it and compare against what the mobile app's chat service expects to parse.
- **Mobile:**
  - Increase the HTTP client timeout for the AI chat endpoint specifically to something like 30–60 seconds (the observed response times are up to ~25s, so a 15–20s timeout is too tight). Locate the axios instance / fetch wrapper (likely `services/api.ts` or `lib/apiClient.ts`) and either raise the global timeout or set a per-request timeout override just for the `/ai/chat` call.
  - Confirm the response parsing code matches the actual backend shape (see backend step above) — add defensive logging (`console.log(response.data)`) temporarily in the chat send handler to see exactly what's coming back when it "fails."
  - Add proper error surfacing: if the request truly times out or errors, the "Failed to send message" bubble should ideally allow retry (tap to resend), which appears to already exist visually (Image 4) but confirm the retry action re-sends correctly.

**Additionally — chat input should float above keyboard (WhatsApp-style):**
- Locate the chat screen (likely `app/rahal-chat/index.tsx` or similar) input bar component.
- Wrap the message input + send button (and the whole chat screen if not already) in `KeyboardAvoidingView`:
  ```jsx
  import { KeyboardAvoidingView, Platform } from 'react-native';

  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // tune per header height
    style={{ flex: 1 }}
  >
    {/* message list */}
    {/* input bar */}
  </KeyboardAvoidingView>
  ```
- If already using `KeyboardAvoidingView` but it's not working correctly, common issues:
  - `behavior="height"` on iOS causes layout jumps — use `"padding"` on iOS.
  - Missing `keyboardVerticalOffset` to account for a custom header (if using `expo-router`'s `Stack.Screen` header or a custom header component, the offset needs to include its height).
  - The FlatList/ScrollView for messages should also auto-scroll to bottom on new message and on keyboard show — confirm `scrollToEnd()` (or `FlatList.scrollToOffset`) is called both when a message is sent and when the keyboard opens.
- Consider using `react-native-keyboard-controller` or `expo`'s newer keyboard APIs if `KeyboardAvoidingView` continues to be unreliable across Android/iOS — but try the standard fix first since it's usually sufficient.

---

## 5. App icon (home screen icon) is still the default Android/Expo icon instead of the branded logo

**Symptom:** On the Android home screen / app drawer (visible in Image 5), the app shows the default green Android-robot-on-teal-grid placeholder icon labeled "Rahal رحّال" instead of the actual brand logo.

**Root cause:** `app.json`'s `icon` / `android.adaptiveIcon` config either isn't set, points to the wrong/missing file, or was set after the last native build (icon changes require a rebuild, same as splash).

**Fix:**
- In `app.json`, under `expo`:
  ```json
  {
    "expo": {
      "icon": "./assets/logo-2.png",
      "android": {
        "adaptiveIcon": {
          "foregroundImage": "./assets/logo-2.png",
          "backgroundColor": "#<PRIMARY_COLOR_HEX>"
        }
      },
      "ios": {
        "icon": "./assets/logo-2.png"
      }
    }
  }
  ```
- Notes on the asset itself:
  - For Android **adaptive icons**, `foregroundImage` should ideally be a version of the logo with safe padding (the outer ~33% of a 1024×1024 canvas gets cropped/masked by the system depending on device icon shape) — if `logo-2.png` is a full-bleed square logo with no padding, parts of it may get cliped by the adaptive icon mask. If it looks cropped after rebuild, create a padded variant specifically for `foregroundImage`.
  - Recommended source size: 1024×1024 PNG, transparent background, for both `icon` and `foregroundImage`.
- Same as the splash screen — **this requires a new native build** (`eas build --profile preview --platform android`), it will not appear from just reloading the JS bundle or even from Expo Go.
- After rebuilding, uninstall the previously-installed test APK from the device before installing the new one — Android sometimes caches the old icon/label if you install an update over the same package without a clean uninstall, especially during rapid iterative test builds.

---

## Suggested execution order for the agent

1. Fix #1 and #5 together (same asset, same `app.json` section, same native rebuild needed) — confirm exact logo path and primary color hex from the codebase before writing config.
2. Fix #2 (pure UI/layout, no rebuild needed, testable instantly in Expo Go / dev client).
3. Fix #3 (mobile pagination logic + verify backend contract) — testable in dev client, no native rebuild needed.
4. Fix #4 (AI chat timeout + response parsing + keyboard-avoiding input) — testable in dev client, no native rebuild needed.
5. Do one final `eas build --profile preview --platform android` once all fixes are in, to validate #1 and #5 together with everything else in one test build.

Items 2, 3, and 4 do NOT require a new native build — they can be verified quickly via `npx expo start` (dev client) before spending time on a full EAS build. Only bundle the final EAS build once everything is confirmed working in the dev client, to save build minutes/time.
