# ProofFolio website

Static site: HTML, CSS and vanilla JavaScript. No build step, no dependencies, no third-party requests (system fonts only).

```
index.html              Landing page
privacy-policy.html     Privacy Policy (link this in Play Console)
assets/css/styles.css   All styles, tokens at the top
assets/js/config.js     The one file you edit: Play link, contact email, policy dates
assets/js/main.js       Nav, scatter/gather demo, tabs, config wiring
assets/img/             Placeholder logo mark, favicon, social image
```

Preview locally: open `index.html`, or run `python3 -m http.server` in this folder.

## Before launch: replace these placeholders

1. **Play Store link.** Set `playStoreUrl` in `assets/js/config.js`. Until then, every Google Play button shows a short notice instead of linking.
2. **Contact email.** Set `contactEmail`. It fills the footer "Contact" link (hidden while empty) and the Privacy Policy.
3. **Developer name and dates.** Set `developerName`, `effectiveDate`, `lastUpdated`.
4. **Brand.** No ProofFolio assets were available, so `assets/img/logo-mark.svg`, `favicon.svg` and `og-image.png` are placeholders. Swap in the real icon. Replace the hero mockup with real screenshots when you have them (keep the "illustrative" caption only if they stay mockups).
5. **Social image URL.** `og:image` / `twitter:image` are relative. Change them to absolute URLs once the domain is known.
6. **Official badge.** The Play button is a plain custom button. If you want Google's badge, use Google's official asset and follow its brand guidelines.

## Privacy Policy: verify against the real app

The policy was written without access to the app's code, so it states no data practice that could not be known from the product description. Yellow highlights and "Developer to confirm" notes mark what to check. A banner at the top counts them and hides itself when none remain.

Checklist:

- **AndroidManifest.xml** (and merged manifest): every `uses-permission`. Keep only those rows in the permissions table.
- **Dependencies** (`build.gradle` / equivalent): analytics, crash reporting, ads, auth, cloud, payment/subscription SDKs. List any that receive data.
- **Network use:** does the app send anything off-device, or only load webpages the user opens?
- **Backup:** `android:allowBackup` and backup/data-extraction rules.
- **Vault:** how the password is checked and stored, whether a recovery key exists, whether files are encrypted, and what happens if access is lost.
- **Storage:** app-private copies of imported files vs. references; what deleting a project or item removes; recycle bin behaviour; what uninstall does.
- **Children:** intended audience; match Play Console target audience and content declarations.
- **Data safety form:** the policy and the Play Console Data safety answers must agree.
- **Legal review** is advisable, especially for regional rights and children's privacy.

Then delete the banner and all `.confirm` notes and unused table rows. This is a drafting aid, not legal advice, and nothing here claims Google approval.

## Honest-claims notes (landing page)

- No ratings, testimonials, user counts, awards, prices or encryption claims.
- Offline copy only promises what the brief states (organizing without a constant connection) and lists webpages, links and online services as needing a connection. If some features (for example report generation, or how saved webpages are stored) behave differently offline, adjust the "Offline and privacy" section.
- All sample names, dates and projects are made up and labelled as illustrative.

## Notes on the code

- Design tokens (colour, type, space, radius, shadow) are CSS variables at the top of `styles.css`. Each feature has a folder-tab colour (`--t-*`) reused wherever that feature appears.
- Works without JavaScript: sections still read in full, use-case sheets stack, and the scatter demo falls back to a list.
- `prefers-reduced-motion` is respected; the auto-gather animation does not run, and the button still toggles the state.
- Keyboard: skip link, visible focus rings, arrow-key navigation in the use-case tabs, Escape closes the mobile menu.
