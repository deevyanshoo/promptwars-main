# Main-build verification

19 September 2026. Tests below describe the main workspace, not inherited warmup claims.

## Automated tests

`npm test` on Node v22.23.1: **25 passed, 0 failed** at 12:28 PM IST. HTTP tests require local port binding; the initial sandbox-only invocation failed with EPERM, then passed with permitted local binding.

Coverage includes DAG parallel start, join ordering, at-most-once and dependency-scoped results, invalid graph rejection, failure blocking, deadlines and request isolation; gateway concurrency release and malformed responses; invalid uploads without calls, MIME mismatch, canonical base64/size/dimension bounds, extraction schema/unreadable states; substantial-risk replacement; explicit save/completion/undo/reload, date cues, corrupt/unavailable/quota storage; translation parity, prohibited dash punctuation and palette contrast; HTTP limits, sanitized failures and throttling.

## Real local browser and provider observations

At http://localhost:8083 using the actual configured Vertex AI gateway:

- Fresh visit opened in Hindi. All controls rendered with explicit keys.
- A browser-generated synthetic community-notice PNG went through the normal file-input change handler, client preparation and `/api/extract`. No response was mocked. Extracted English text retained 25 September 2026, 11:00 AM, community hall, optional bag and no fee. Three real extraction nodes completed, extraction about 4.7 seconds.
- Edited 11:00 AM to 11:30 AM before confirming review. Real planning returned Hindi explanation and steps using 11:30 AM. Five nodes completed; independent branches about 3.7 and 3.3 seconds.
- Selected an optional date, opened Hindi guided mode, completed step 1, explicitly saved, reloaded and resumed at step 2. Completion and date persisted. Stored content contained no original message or image bytes.
- Switched to English and reloaded. English preference persisted; the saved Hindi plan was unchanged.
- Real synthetic suspicious-message planning identified one-time-password, remote-access and urgency indicators. Instructions were withheld, preparation omitted, safe independent verification steps shown and no clickable links rendered. Five nodes completed. No definitive fraud verdict appeared.
- Hindi voice Lekha (hi-IN) was available. Listen set speechSynthesis.speaking true; Stop cleared it. This verifies browser playback state, not audible quality. No new live microphone speech was supplied by the agent.
- Inspected desktop success and 390px enlarged-text screenshots. Hindi vowel marks and controls were readable. At 390px, document width was exactly 390px with 24px body text. Generated fraud copy contained no em/en dashes.
- Mocked one HTTP 502 in the browser to verify failure UI: original text retained, prior result hidden, retry visible, failed and blocked node statuses shown. Retried through the real provider afterward. This injected response tests UI handling, not a live provider outage.

## Still pending at this milestone

Anonymous main deployment, public photo/state flow, final keyboard/zoom and voice fallback checks, full release provenance, and demo video recording/upload. These are not claimed complete. Optional SOS is not implemented. Screenshots and any recordings stay outside Git.
