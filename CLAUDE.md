# Notes for Claude: Kathryn's phone apps (PWAs)

Kathryn's apps (Garden Diary, Memory Jar, Boundaries, and any future ones) are all published
under ONE web address, `spr1ngw1ll0wtr33.github.io`, each in its own folder. On her phone they
share one storage area. Lessons learned the hard way on 30/09/2026:

1. **Manifest `id` must be unique to the app.** Use its own folder, e.g. `"id": "/RepoName/"`.
   Never `"./"` or `"/"`: these resolve to the site root, so two apps end up with the same
   identity and Chrome says "This app is already installed", then cannot open it.
2. **Service worker clean-up must only delete this app's own caches** (filter by the app's own
   cache-name prefix). Deleting every cache wipes the other apps' offline copies.
3. **Never advise "clear site data" / "cookies and site data" in Chrome for this address.** It
   wipes every app's saved entries at once. Clearing "cached images and files" only is safe.
4. **Diagnose install problems with evidence first.** On the phone, `chrome://webapks` lists every
   installed app with its Scope, Start URL and Manifest Id. Check it before trying fixes.
5. **Check how a new app fits alongside the existing ones before building**, not after.

## Working with Kathryn
- She is not a developer. Give plain-English, numbered, click-by-click instructions, from the
  start, every time. Don't assume she knows GitHub terms.
- Her phone is a Samsung Android using **O'launcher** (text only, no icons): app names must be
  short (about 12 characters or fewer) and apps must be **installed**, not added as shortcuts.
- British English, dd/mm/yyyy, 12-hour clock. Don't repeat warnings she has already answered.
