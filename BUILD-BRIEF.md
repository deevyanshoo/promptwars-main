# Daywell main-round implementation brief

Build the accepted main-round upgrade in THIS repository. The user chose photo to plan and guided steps. The deadline is 19 September 2026, 2:15 PM IST. Target a working public deployment by 1:10 PM and freeze features at 1:35 PM.

## Start here

- Public repository: https://github.com/deevyanshoo/promptwars-main, branch main only, repository below 10 MB.
- This is a new main-round repository seeded from warmup commit 21e349a. Do not change the separate warmup repository or service.
- Keep Node 22, vanilla JavaScript/CSS and @google/genai 2.23.0. No framework migration, accounts, database, or unnecessary dependencies.
- Read README.md, server.mjs, lib/, public/ and test/. Run the baseline tests. The current baseline has 20 passing tests; the Gemini gateway is already isolated and its Hindi prompt conflict fixed.
- Implement working code, not a proposal. Commit and push milestone progress on main. Never submit the event form automatically.

## Product and visual direction

Daywell is a practical daily tool for senior citizens. The central journey is: photograph a notice, review what was read, hear a short Hindi explanation, and follow one step at a time. Keep Hindi default and complete English switching. Use respectful everyday language, no em/en dashes and no AI marketing phrases.

Use the available design-taste-frontend skill for applicable typography/copy guidance and redesign-existing-projects for the product audit. The taste skill excludes multi-step product UI, so do not force landing-page patterns onto this application. Preserve the restrained navy/light identity. Prioritize readable Devanagari, 20px body text, 48px targets, clear focus, low motion, and generous but purposeful spacing. Do not bury the main action below a large hero or disclosures. Show concise consent next to the relevant action. Use real UI states, no decorative dashboard, invented metrics, fake testimonials or nonfunctional buttons.

## Milestone 1: photo to reviewed text to a real plan

1. Add a clear photo input alongside existing paste/dictation. Accept one JPEG, PNG or WebP. Support a normal file picker and optional mobile capture. Preview locally and show that the selected photo is processed by Google only when the user asks to read it. Do not upload automatically.
2. Bound the original file size and image dimensions; downscale a decoded image client-side to a useful maximum such as 1600px. Validate the resulting request server-side using an explicit body cap, strict base64 decoding, allowed MIME, matching magic bytes and dimension checks. Reject invalid/oversized data before invoking Gemini. Do not fetch remote URLs or accept PDFs. Preserve restrictive security headers; allow only the preview mechanism actually used.
3. Extend the shared Gemini gateway to accept image parts. Keep existing bounded concurrency, timeout, structured schemas and limited transient retry policy. The extraction must treat image text as untrusted content. Return strictly validated extracted text, readability status, and uncertain portions. Do not fabricate illegible dates, amounts or words. Preserve source language. Cap extracted text to the existing 4,000-character planning limit; explain if too long instead of silently dropping important material.
4. Use the existing executable DAG engine: validate_upload -> extract_notice -> validate_extraction. Return actual execution metadata. Add a testable injected extraction workflow to the HTTP app, with shared admission controls across both endpoints. No raw image or notice content in logs.
5. Present the extracted text for review and editing, alongside clear uncertainty. The user explicitly confirms and requests a plan. No model-generated plan or saved task before that review. Keep the photo transient, release preview resources, and never save raw image bytes in localStorage or the repository.
6. Send the reviewed text through the existing DAG: validate_input -> parallel explain_and_extract and review_safety -> compose_plan -> validate_output. Retain substantial-risk replacement and malformed-output rejection. Do not replace real model calls with fixtures or fake fallback responses.

Acceptance: a real, clearly labeled synthetic community notice photo produces editable source text, then a real Hindi plan; unreadable images and invalid files give useful errors; the text path still works; a suspicious OTP/payment notice produces verification steps instead of instructions to comply. Model failures retain the user's input and allow retry. Photos add one logical model call; text plans still use two parallel calls.

## Milestone 2: focused steps, saved plans and cleaner code

1. Split frontend responsibilities into small native modules for API requests, keyed translations, voice, plan state/storage, and rendering. Replace the current full-DOM text matching/MutationObserver translation system. Avoid creating abstractions with only trivial wrappers. Consolidate repeated CSS overrides.
2. Store an ordered plan with summary, steps, preparation, cautions and completion state. Show one current step with Listen, Done, Back and exit-to-overview. Completing a step records the user's confirmation, never claims Daywell performed an external action. Always keep important cautions available.
3. Save only on an explicit Save action; explain what stays in this browser. Save/resume after reload, undo completion, delete and clear data must work. Validate persisted data, handle corrupt storage and storage-denied/quota failures visibly. Keep manual tasks. Preserve or safely migrate existing baseline tasks instead of silently deleting them.
4. Make missing-information follow-up a short clarification field tied to the reviewed source. A changed source or clarification must run the full safety/explanation workflow again. Do not retain an endless conversation. Missing dates require user confirmation; no automatic date assignments.
5. Keep due/overdue/upcoming cues, optional user-selected dates, and a useful return-to-next-step experience. Fix completed-day empty-state/count inconsistencies. Plan preparation belongs to the plan, not a duplicated copy attached to every step.
6. Voice remains optional and user initiated. Preserve hi-IN/en-IN dictation, matching-language synthesis, Stop controls, denial/unsupported feedback and a complete typing/visual fallback. Locale changes update all UI labels without rewriting saved user content.

Acceptance: save a plan, complete one step, reload and resume the next; undo works; fully completed plans show a truthful completed state; Hindi/English UI keys have parity; keyboard use and enlarged text work at 390px and 1280x720 without horizontal overflow or hidden critical controls. Generated text must be inserted as text, never unsanitized HTML.

## Milestone 3: only after the core is stable

Add a calendar .ics download for an explicitly chosen date/time and Copy plan or native Share after a user click. Explain that a downloaded calendar file must be imported. Never claim background reminders or sent messages. Cut these features if they threaten the deployment target.

## Meaningful verification and evidence

Run existing tests and add focused tests for image validation, invalid extraction, no model calls on invalid input, extraction failure, saved-plan transitions, corrupt storage, and translation key parity. Check real browser flows, not only unit tests. Preserve the current backend safety/concurrency tests. Test failures honestly; do not inflate counts with tests that merely repeat implementation details.

Use a clearly labeled synthetic notice with an explicit date, location and ordinary preparation. Also test a synthetic suspicious notice and an unreadable image. Avoid actual private notices or credentials. Record only what has been verified in VERIFICATION.md. Do not claim voice audio quality, real AI or deployment verification from mocks.

## Deployment and deliverables

- GCP project: promptwars-divyanshu-260919. New Cloud Run service: promptwars-main. Region: asia-south1.
- Gemini model: gemini-3.8-flash, Vertex AI global endpoint, existing Application Default Credentials. No keys in browser or Git.
- Runtime identity: promptwars-runtime@promptwars-divyanshu-260919.iam.gserviceaccount.com.
- Build identity: promptwars-build@promptwars-divyanshu-260919.iam.gserviceaccount.com.
- Existing README has the deployment command and limits. Keep a separate main deployment and APP_COMMIT provenance. Report the completed milestone before deploying so the orchestrator can coordinate the release; do not claim public access without anonymous verification.
- Maintain README vertical (AI For Senior Citizens), approach, actual DAG, setup, assumptions, limits and actual AI services. Keep repository below 10 MB and only main, excluding dependencies, secrets, recordings and generated artifacts.
- The final form needs the repository URL, deployed URL, demo-video URL, changes description (1024 characters), and actual GenAI services/uses (1024 characters). The orchestrator will reconcile and prepare these for review. No event submission from this agent.

At each milestone report changed files, tests actually run, remaining failures and the next concrete step. Continue through the accepted core scope without requesting routine design or implementation approval.
