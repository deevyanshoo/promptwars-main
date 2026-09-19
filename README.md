# Daywell

Daywell is a Hindi-first daily organizer for the **AI For Senior Citizens** challenge. Read a photographed notice, review the words, understand the message and its cautions, follow a step, then explicitly save a plan and return to it.

- Public repository: https://github.com/deevyanshoo/promptwars-main
- Public app: https://promptwars-main-589901835092.asia-south1.run.app (service `promptwars-main`, Cloud Run, `asia-south1`).
- Node.js 22, vanilla HTML/CSS/JavaScript, `@google/genai` 2.23.0. Only branch `main`.
- The separate warmup repository and service are unchanged. No event form is submitted automatically.

## Working features

Use either **Photo** or **Type or speak**. Every message receives the same independent safety check automatically. Choose one JPEG, PNG or WebP, or explicitly start the laptop/mobile camera for a video-only live preview. Take photo captures one still; Cancel stops the camera. Tracks also stop on capture, input/navigation changes, page hiding and errors. Camera denial or missing hardware leaves upload and typing available. No microphone is requested by the camera. Preview the still locally and explicitly request extraction. The browser prepares a bounded image. Gemini transcribes it in its original language and identifies uncertainty. Review and edit the text, confirm review, then request a plan. Pasting and optional dictation are complete alternatives. Synthetic ordinary and suspicious-message examples use the real model workflow.

A plan contains an attributed explanation, cautions, essential questions, up to five ordered steps and optional preparation. Guided mode shows one step with Listen, Done, Undo, Back, Next and overview controls. Completion records the user's confirmation, never an external action. A clarification reruns both independent planning branches with the reviewed message.

Explicit Save keeps approved plan content, user-selected dates and completion in browser localStorage. Resume after reload, undo, delete, manual tasks and confirmed clear-data are supported. No inferred deadline is saved. Opening the page shows overdue, due-today and upcoming counts and a next useful action. There are no background reminders. Raw source messages and images are not persisted. Existing `daywell.v1` tasks are safely migrated. Invalid stored data is preserved until the user clears it; blocked storage and quota failures are visible.

Hindi is the first-visit language. English switching and larger text persist. Saved content is not translated when the interface changes. Explicit translation keys cover controls and states. The interface uses 20px text, large native controls, visible focus, safe text rendering, mobile layout and reduced-motion support.

## Actual executable DAGs

```mermaid
flowchart LR
  U[validate_upload] --> X[extract_notice] --> T[validate_extraction]
  T -. User reviews and confirms in a separate request .-> V[validate_input]
  V --> E[explain_and_extract]
  V --> S[review_safety]
  E --> C[compose_plan]
  S --> C
  C --> O[validate_output]
```

`lib/dag.mjs` schedules declared dependencies, rejects duplicate IDs, missing dependencies and cycles, and runs ready independent nodes concurrently. Each node runs at most once with isolated request state and only its dependency outputs. Failed required nodes block downstream composition. Actual node statuses and durations appear in a collapsed disclosure. No prompts, hidden reasoning or provider logs are exposed.

The two planning branches independently receive the original reviewed source and any user clarification. Structured model output is validated before deterministic composition. Substantial risk replaces candidate instructions with cautious verification steps and removes preparation. Advisory signals are not definitive fraud verdicts. The application neither fetches links nor contacts anyone. A separate extraction request ends before the human review boundary.

## Modules and limits

- `server.mjs`, `lib/http.mjs`: static route allowlist, HTTP limits, shared admission, sanitized error categories and security headers.
- `lib/gemini.mjs`: the isolated, injectable Vertex AI gateway.
- `lib/images.mjs`, `lib/contracts.mjs`, `lib/extraction.mjs`, `lib/workflow.mjs`: upload contracts, strict output validation and declared DAGs.
- `public/api.js`, `photo.js`, `camera.js`, `voice.js`, `plans.js`, `render.js`, `i18n.js`: API, transient photo preparation, browser speech, validated persistence, focused rendering and keyed copy. `app.js` connects the controls.

Input is bounded to 4,000 characters plus an optional 800-character clarification. Original photos are limited to 12 MiB, 12,000px per edge and 48 million decoded pixels. Prepared images have a longest edge of 1,600px and a 3 MiB limit. The server validates canonical base64, permitted MIME, matching image signatures, supported dimensions and structural bounds. It accepts no remote URLs or PDFs and writes no photos to disk. Planning bodies are limited to 20 KB; extraction bodies to 4.3 MB.

Admission is shared across endpoints: two active workflows, four concurrent provider calls, 20 requests per minute per process. Each SDK call allows at most two attempts for transient HTTP failures. Calls have a 40-second timeout, workflows a 45-second deadline and HTTP requests a 50-second deadline. Planning allows 3,000 output tokens per branch; extraction 6,000. Malformed output is never a successful fallback. Cloud Run is capped at one instance, so process-local admission resets on restart.

## GenAI and browser speech

The only runtime GenAI service is **Google Gemini on Vertex AI**, configured model `gemini-3.8-flash`, global endpoint, `vertexai: true`, thinking level `LOW`, SDK **2.23.0**. Photo extraction makes one logical call. Planning makes two parallel logical calls. There is no separate translation call. Navigation, saving, completion and due-date cues are deterministic and make no model calls.

Browser SpeechRecognition and SpeechSynthesis are separate browser features, not Gemini audio understanding. Dictation uses `hi-IN` or `en-IN`, starts on a click, appends editable text and never submits automatically. The browser may use its own online service. Read aloud chooses a matching-language voice, loads `voiceschanged`, cancels previous playback and provides Stop. Missing voices and denied or unsupported microphone access retain a visual/typing fallback. Audio stops on competing actions, navigation, language changes and leaving the page. Actual main-build checks and limitations are in `VERIFICATION.md`; the prior warmup microphone success is not presented as a new main-build live speech test.

## Module boundaries and state invariants

- `server.mjs` and `lib/http.mjs` own routing, body limits, same-origin checks and shared admission. `lib/gemini.mjs` owns provider configuration, call limits and timeouts.
- `lib/dag.mjs` schedules declared dependencies. Extraction/planning workflows and contracts validate data at each boundary. Both planning branches must succeed before composition.
- `public/api.js` handles requests. `photo.js`, `camera.js` and `voice.js` own transient capture resources. Only the current recognition session may deliver callbacks.
- `plans.js` owns validated local persistence and the pure completion helper. `task-utils.js` owns local-date validation and language-independent cue keys. Production rendering and tests use these same helpers; `i18n.js` translates the keys.
- `app.js` coordinates events and current draft state; `render.js` builds safe text-only UI. Replacing a photo invalidates its review and draft, never saved plans. A failed planning request retains its exact reviewed source, locale and clarification for retry. Editing the source or changing language invalidates that retry. Completion records the user's confirmation only, and persistence requires explicit saving.

## Run and test

Use Node.js 22 and existing Google Application Default Credentials outside Git:

```sh
npm ci
export GOOGLE_CLOUD_PROJECT=promptwars-divyanshu-260919
export GOOGLE_CLOUD_LOCATION=global
export GEMINI_MODEL=gemini-3.8-flash
npm start
npm test
```

Open http://localhost:8080. `PORT` is supported; the server binds `0.0.0.0`. `GET /health` reports `APP_COMMIT` without calling Gemini. No login or database is required.

### Optional focused browser regressions

The local quality candidate passes 35 Node tests and 10 focused browser groups. These browser checks exercise real UI event handlers with mocked API responses and controlled speech sessions; they are not new live-provider or physical-microphone verification. They are separate from the Node test count and real-provider smoke checks. Install verification tools outside the application repository. With Node.js 22, run these commands from the app folder in a POSIX shell:

```sh
DAYWELL_TEST_TOOLS="$(mktemp -d)"
npm install --prefix "$DAYWELL_TEST_TOOLS" playwright@1.55.0
"$DAYWELL_TEST_TOOLS/node_modules/.bin/playwright" install chromium
PLAYWRIGHT_MODULE="$DAYWELL_TEST_TOOLS/node_modules/playwright/index.mjs" \
APP_URL=http://localhost:8080 node test/release.browser.mjs
```

Start the app separately with `npm start`. The default uses Playwright's installed Chromium on the host OS. An optional `CHROME_PATH` selects an existing Chrome executable. The suite checks photo/draft invalidation, saved-plan preservation, failure followed by preference changes, zero-step resume, timer-refreshed daily controls, exact-request retries, retired recognition callbacks, and translated date/completion behavior. Browser recordings and local evidence paths in VERIFICATION.md are not required to run the app.

Development assistance used OpenAI Codex. The application does not call OpenAI APIs. Programmatically drawn images are used as automated-test fixtures. The actual submitted video uses two different synthetic photos, 01-community-notice-en.png and 03-suspicious-payment.png, created with OpenAI image generation outside the app. Browser speech, local system-voice demo narration, FFmpeg, Cloud Run and video hosting are not additional runtime GenAI services.

## Deploy

```sh
gcloud run deploy promptwars-main \
  --source . --project promptwars-divyanshu-260919 --region asia-south1 \
  --build-service-account projects/promptwars-divyanshu-260919/serviceAccounts/promptwars-build@promptwars-divyanshu-260919.iam.gserviceaccount.com \
  --service-account promptwars-runtime@promptwars-divyanshu-260919.iam.gserviceaccount.com \
  --allow-unauthenticated --min 0 --max 1 --cpu 1 --memory 512Mi --cpu-throttling \
  --concurrency 8 --timeout 60 \
  --set-env-vars GOOGLE_CLOUD_PROJECT=promptwars-divyanshu-260919,GOOGLE_CLOUD_LOCATION=global,GEMINI_MODEL=gemini-3.8-flash,APP_COMMIT=YOUR_COMMIT
```

Only package manifests, Dockerfile, server, library and public assets enter deployment uploads. Credentials, dependencies, recordings, screenshots and local environments are excluded. The container runs as non-root. Restrictive CSP, same-origin POST checks and textContent rendering remain in place.

## Assumptions and limitations

This is a bounded public demonstration, not a production emergency, medical, financial or fraud-detection service. Gemini can misread images, miss risk indicators or offer unsuitable advice. Confirm important details independently. User review cannot guarantee accuracy. Browser storage is specific to a profile, accessible to people using it and not synchronized or encrypted by Daywell. Google processes submitted content; no infrastructure-level zero-retention promise is made. Application logs omit messages, photos and provider content, while managed infrastructure may retain metadata. Provider cancellation cannot guarantee remote compute stops.

Optional live camera help sessions, simulated SOS, emergency dispatch, mobile apps and calendar export are not implemented. The core is prioritized for deployment. See `VERIFICATION.md`, `DEMO.md` and `SUBMISSION.md` for evidence and submission review materials.

## Submission demo

[Watch the 119-second unlisted demo](https://youtu.be/eXG8rFQDzvY). It records public application release `7775866` with English narration and the default Hindi interface. The two synthetic notice photos came from OpenAI image generation outside Daywell. OpenAI Codex assisted development; runtime GenAI remains Gemini on Vertex AI only. Narration uses local macOS speech synthesis, separate from optional browser speech in the app. Photos and video are kept outside Git.

The quality candidate changes internal state handling and shared helpers, not the successful photo-to-review-to-plan, guided completion, save/resume or fraud-caution journey shown in the video. The video remains a recording of `7775866`, not a newer commit. Candidate tests exercise these behaviors locally with controlled responses. After an authorized deployment, repeat the two Demo Pack photo journeys on the public URL using real Gemini and verify the deployed health commit before claiming new-release demo-path verification.
