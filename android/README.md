# BrainRush Android app (TWA)

The Android app is a Trusted Web Activity (US-40, D-43): a thin wrapper that opens the live site
`https://brainrush.integration.ninja/?source=twa` full screen in Chrome. It was generated with
Bubblewrap (`@bubblewrap/cli` 1.27.0). Every web deploy updates what the app shows; a new app
build is only needed when `twa-manifest.json` changes (name, colours, icons, version, signing).

This folder is in the repository but never served: `.htaccess` blocks `android/`, and it is not
uploaded with FTP/File Manager deploys.

## Signing key

- Upload key: `C:\Users\NB28970\keys\brainrush-upload.keystore`, alias `brainrush-upload`. It is
  outside the repository on purpose; never copy it in here (`*.keystore`/`*.jks` are git-ignored).
  Keep a backup of the file and its passwords outside this computer.
- Upload key SHA-256 (public, also in `twa-manifest.json` and `/.well-known/assetlinks.json`):
  `FD:1D:BC:B3:22:53:FA:1F:4F:38:C9:EB:99:9A:BF:E1:DF:E1:ED:C9:9F:BB:ED:A8:08:41:F3:48:9F:55:27:B1`
- With Play App Signing, Google re-signs the app with its own key. Once Play Console shows the
  **App signing key** SHA-256 (App integrity > App signing), add it as a second entry in
  `/.well-known/assetlinks.json` (and `bubblewrap fingerprint add <sha256>`), deploy it and purge
  the Hostinger CDN. Without it, the Play-installed app shows a URL bar.

## Build

Run from this folder in a normal terminal (Bubblewrap uses its own JDK 17 and Android SDK in
`%USERPROFILE%\.bubblewrap`). The build asks for the key store and key passwords.

```
bubblewrap update --skipVersionUpgrade   # only after editing twa-manifest.json
bubblewrap build
```

Output (git-ignored): `app-release-bundle.aab` for Play Console and `app-release-signed.apk` for
testing (`adb install app-release-signed.apk`).

For a new Play release, raise the version first: `bubblewrap update` (bumps `appVersionCode`),
then `bubblewrap build`.
