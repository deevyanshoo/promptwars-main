# Main-build verification

19 September 2026. Tests below describe the main workspace, not inherited warmup claims.

## Automated tests

`npm test` on Node v22.23.1: **30 passed, 0 failed** at 12:50 PM IST. HTTP tests require local port binding; the initial sandbox-only invocation failed with EPERM, then passed with permitted local binding.

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

## Public verification

Public URL: https://promptwars-main-589901835092.asia-south1.run.app

Initial deployed commit `f244218`, revision `promptwars-main-00001-hgg`. Anonymous curl health returned this commit. IAM readback contained only `allUsers` with `roles/run.invoker` for this service. Runtime identity, CPU 1, memory 512Mi, request-based CPU, concurrency 8, timeout 60 and maximum scale 1 were read back. Minimum scale defaults to zero. Warmup was not changed.

A separate, fresh headless Chrome context then tested the public app with no account or identity token. All of these passed:

- Hindi first visit and no automatic image upload.
- Real PNG file selection, client preparation, public extraction, explicit review requirement, edited 11:30 time, and real Hindi plan.
- Guided completion, optional due date, explicit save, reload/resume, all-complete state and undo.
- English preference persistence without rewriting the stored Hindi explanation.
- Real public suspicious-message workflow returned substantial risk, withheld instructions, no preparation, and safe steps with no actionable links.
- 390px enlarged text had no horizontal overflow. A 640px viewport with 40px root text passed a 200% equivalent reflow check. This is an automated reflow approximation, not a claim of manually testing every browser zoom setting.
- Keyboard Tab reached the skip link; Enter focused main.
- Injected HTTP 502 retained source and hid a stale plan. Browser page-error collection was empty.

Evidence files outside Git: `/private/tmp/daywell-main-evidence/browser-report.json`, `notice.png`, `public-fraud.png`, and `mobile-large.png`. The JSON separates real HTTP responses from the deliberately mocked failure response. The repeatable browser runner is `/private/tmp/daywell-browser/check.mjs`; Playwright is installed only in that temporary runner, not the app dependencies.

Voice fallback checks used controlled browser doubles: denied recognition displayed the Hindi permission message and typing remained usable; an empty voice list returned `voice_missing`. These are simulated capability failures, not live microphone permission observations. The earlier user-confirmed warmup microphone test is historical, not a main-release microphone test.

GitHub API and remote inspection reported a public repository, size 48 KB at the initial release, and only `refs/heads/main`. Local `.git` was about 300 KB. A credential-pattern scan found no private keys, Google API keys or OAuth token strings in tracked application content. This is a focused check, not a security certification.

## Remaining limitations

Earlier milestone recording/upload was pending; the final release evidence below supersedes that status. Optional SOS is not implemented. Hindi playback state and Stop were observed, but audible quality was not assessed. No real microphone recording was supplied during main-build checks. Browser automatic translation interfered with the shared interactive test tab; the independent headless run avoided this, and the final HTML adds a no-automatic-translation hint. Screenshots and recordings stay outside Git.

## Requested camera update

The separate Suspicious message tab was removed. There are now exactly two input tabs, Photo and Type or speak. Both retain automatic independent safety review. The suspicious synthetic example remains available.

A real `navigator.mediaDevices.getUserMedia` implementation requests `audio: false`, shows a live video preview, and captures one still into the existing photo preparation/review flow. No upload occurs on camera start or capture. Tests with Chrome's simulated video device passed preview, capture, zero audio tracks, no automatic network request, and track termination on capture, Cancel, input-tab change and pagehide. Controlled NotAllowedError and NotFoundError both kept file upload usable. Three unit tests cover video-only constraints, capture cleanup, late permission response cleanup and fallback states. The user separately confirmed that the physical laptop live preview and capture work.

The full real-Gemini browser suite was rerun on the camera build at localhost:8084 and passed photo extraction, corrected Hindi plan, save/resume, all-complete/undo, language persistence and fraud replacement. Redeployment and public camera verification follow this update.

## P1 release-state correction

Release review identified that replacing a photo could leave the old extracted text, checked consent and current plan in memory. The scoped correction clears only the current review and draft when selecting, capturing or removing a photo. Saved plans are preserved. Starting a new planning request clears the prior draft before validation, so text-size or language renders cannot resurrect plan A after failed request B. Zero-step saved plans open their overview.

`test/release.browser.mjs` passed five focused, mocked-response browser regressions: replacement plus failed extraction and preference changes; photo removal; camera capture; failed B with retained B input and no resurrected A; and zero-step resume. The first four explicitly verify that saved plan A remains unchanged. These tests exercise the real application DOM and event handlers with controlled API responses, not paid model calls. The 30-test Node suite also passes. Corrected public deployment and a new recording are required before submission. The previous recording is superseded. The selected submission-video destination is YouTube unlisted.

## Small daily-handler cleanup

Compared the supplied `code-quality-day-handlers.patch` against the working changes. The final implementation uses the same named `deleteSavedPlan`, `changeManualTask`, `deleteManualTask` and single `refreshDay` as the patch. Both regular render and the 60-second callback now share these handlers. Deleting the active plan uses `clearCurrentDraft`. No wider refactor was applied.

The sixth focused browser regression explicitly invokes the captured 60-second callback, deletes the active plan, changes text size and checks that the deleted plan cannot reappear. It also checks manual completion/deletion after timer refresh. All six mocked-response browser regression groups pass locally. Portable Playwright setup is documented in README; it is not a runtime dependency. Clarification retry preservation, stale voice callback ownership and the other larger review items are deferred to Attempt 2.

## Final release and requested Demo Pack recording

On 19 September 2026, release `7775866ff69ffb238f44a5d846e5778d071c375d` was deployed as `promptwars-main-00004-bh4`, serving 100 percent of traffic. Anonymous GET /health returned the expected full commit. The six focused browser regression groups passed again against the public app with controlled API responses. The 30 Node tests had passed before this release commit.

A fresh account-free Chrome context recorded real public Gemini calls using exactly `/Users/palaksingh/Downloads/Daywell Demo Pack/01-community-notice-en.png` and `03-suspicious-payment.png`. It showed editable extraction, an explicit Room 2 to Room 4 change and review confirmation, Hindi plan, real five-node statuses, guided completion, explicit save, reload/resume, then separate extraction/review/planning for the suspicious photo. Final safe steps said not to share an OTP or transfer money and to verify through independently known bank channels. The optional unreadable image was not included in this recording.

Artifact outside Git: `/private/tmp/daywell-main-evidence/daywell-demo-pack-final-7775866.mp4`, 119 seconds, 1280x720 H.264 with AAC English narration, 3,172,277 bytes. Narration was generated with local macOS Samantha speech synthesis and muxed before upload. Segment durations were measured and checked for overlap. Selected encoded frames were inspected, and the audio stream contains nonzero samples; this is not a claim of human listening-quality review. Scene timestamps and raw recording are preserved beside the MP4. Both synthetic input photos were generated with OpenAI image generation outside the application, separately from Codex development assistance and runtime Gemini.

YouTube Studio confirmed publication as Unlisted with no copyright issues reported: https://youtu.be/eXG8rFQDzvY. The signed-out browser loaded the titled video and 1:59 player. Publication completed shortly after the 1:20 PM target. The event form was not submitted.
