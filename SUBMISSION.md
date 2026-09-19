# Main challenge submission review

Do not submit automatically. Deadline: 19 September 2026, 2:15 PM IST. Current main rules permit three attempts. Confirm all fields before the participant submits.

## Form fields

1. **Challenge:** AI For Senior Citizens
2. **Public repository:** https://github.com/deevyanshoo/promptwars-main
3. **Working deployed URL:** https://promptwars-main-589901835092.asia-south1.run.app
4. **Publicly playable demo-video URL:** https://youtu.be/eXG8rFQDzvY (Unlisted, corrected release 7775866, 119 seconds, English narration, Hindi interface).
5. **Changes/updates description:**

Compared with the previous scored submission, this quality update prevents stopped speech sessions from appending stale text or changing a newer session. Retry preserves the exact reviewed source, language and clarification; editing the source or changing language invalidates it. Production completion and translated date cues now use the same pure helpers covered by tests. The admission test uses an explicit entry barrier, a five-second timeout and cleanup. Module boundaries and state invariants are documented. Verification includes 35 Node tests and 10 focused browser regression groups with controlled provider responses. The Hindi-first photo, review, guided-plan, fraud-caution and save/resume flow is unchanged. No feature, dependency or runtime GenAI service was added. The existing video records the same visible flow at historical commit 7775866.

6. **Actual GenAI services and where used:**

Google Gemini on Vertex AI is the only runtime GenAI service: gemini-3.8-flash, global endpoint, @google/genai 2.23.0, thinking LOW. One structured multimodal call extracts a validated photo and uncertainty. After user review, two parallel calls independently explain the original text and review cautions. Deterministic DAG composition waits for both, replaces risky steps and validates output. Hindi/English use the same calls, with no translation call. Browser recognition and synthesis are separate features, not Gemini audio understanding. Cloud Run hosts the app; saving, completion and date cues use no AI. OpenAI Codex assisted development. OpenAI image generation created the synthetic community-notice and suspicious-payment demo photos outside the app. English video narration uses local macOS speech synthesis. The application makes no OpenAI API calls.

## Release checks

Submitted release dfec448 is public, with runtime code identical to 7775866. Read-only Cloud Run inspection confirms APP_COMMIT dfec44846dbac18ccf26f8906a06d517b0b2e4ae. Thirty Node tests and six focused browser regression groups passed; the latter also passed against the public release with controlled API responses. The final recording uses real public Gemini extraction and planning for both specified Demo Pack photos, including a reviewed Room 2 to Room 4 edit, Hindi guided completion, save/reload/resume and safe fraud-verification steps. YouTube Studio confirmed Unlisted publication. See VERIFICATION.md for evidence and limits. Warmup remains unchanged. Optional SOS is omitted. Portal history verified by the orchestrator: Attempt 1 returned AGENT_FAILED; Attempt 2 scored 94.05 and ranked 1/79. Two of three attempts are used. Per the user, the latest score counts. Any further event submission remains user-owned.

## Approved quality release

The orchestrator approved the production diff and tests for commit, push and deployment. Local results: **35 Node tests passed, 10 focused browser groups passed**. This candidate preserves reviewed source, locale and clarification on retry; ignores retired speech-recognition callbacks; connects production completion and translated date cues to the tested pure helpers; and replaces admission-test timing assumptions with an explicit entry barrier. No new feature or dependency. These are local mocked-provider checks, not new public-release verification. Public release verification is recorded separately after deployment.

Video provenance remains unchanged: the linked video records `7775866` using the two OpenAI-generated Demo Pack photos. Programmatically drawn images belong to separate automated tests. The candidate's internal fixes preserve the demonstrated successful journey; they do not make the video a recording of a newer commit. Real public photo/review/Hindi-plan, save/resume and fraud-path verification against a new release will be checked after deploying the approved commit.
