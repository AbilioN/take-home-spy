# Debugging infinite reload

Your `[DEBUG]` logs show **one** normal load (single MOUNT, auth resolves). So the loop may be:

1. **Full bundle reload** (Metro re-building) – you’d see "Bundled" or "Building" in the terminal over and over.
2. **Fast Refresh** – a code path triggers refresh repeatedly.

## Steps to try

1. **Clear cache and restart**
   ```bash
   npx expo start -c
   ```
   Then open the app again and see if the reload loop still happens.

2. **Run without Fast Refresh**
   ```bash
   EXPO_FAST_REFRESH=0 npx expo start -c
   ```
   If the loop stops, Fast Refresh is likely involved.

3. **See what repeats**
   When the loop happens, watch the Metro terminal for `[DEBUG]` lines:
   - **MOUNT / UNMOUNT** repeating → screen is mounting/unmounting (e.g. navigation or parent).
   - **RootNavigator** with `userId` flipping → auth state changing.
   - **onSwipedAll** or **seed changed** in a loop → swiper callbacks firing without user input.

4. **Temporarily simplify the home screen**
   In `src/navigation/index.tsx`, swap `CatTinderScreen` for a simple placeholder component that only renders `<View><Text>Home</Text></View>`. If the loop stops, the cause is likely in `CatTinderScreen` or the Swiper.

When done debugging, set `DEBUG = false` in `src/debug.ts`.
