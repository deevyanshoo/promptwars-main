# Main challenge submission review

Do not submit automatically. Deadline: 19 September 2026, 2:15 PM IST. Current main rules permit three attempts. Confirm all fields before the participant submits.

## Form fields

1. **Challenge:** AI For Senior Citizens
2. **Public repository:** https://github.com/deevyanshoo/promptwars-main
3. **Working deployed URL:** https://promptwars-main-589901835092.asia-south1.run.app
4. **Publicly playable demo-video URL:** https://youtu.be/eXG8rFQDzvY (Unlisted, corrected release 7775866, 119 seconds, English narration, Hindi interface).
5. **Changes/updates description:**

Daywell is a Hindi-first daily organizer for older adults. Capture a still with the video-only camera or upload a notice, explicitly request extraction, review and correct the words, then receive a plain-language plan with independent cautions. Follow one guided step at a time, choose dates, explicitly save, reload and resume. The real backend DAG runs explanation and safety review concurrently and waits for both. Substantial risk replaces candidate instructions with safe verification steps and removes preparation. The app includes English switching, larger text, optional browser speech, manual tasks, local due-date cues, honest retry states and validated browser-local storage. Photo and request limits, structured output validation and shared AI admission keep the workflow bounded. No external actions, emergency dispatch or automatic reminders are claimed.

6. **Actual GenAI services and where used:**

Google Gemini on Vertex AI is the only runtime GenAI service: gemini-3.8-flash, global endpoint, @google/genai 2.23.0, thinking LOW. One structured multimodal call extracts a validated photo and uncertainty. After user review, two parallel calls independently explain the original text and review cautions. Deterministic DAG composition waits for both, replaces risky steps and validates output. Hindi/English use the same calls, with no translation call. Browser recognition and synthesis are separate features, not Gemini audio understanding. Cloud Run hosts the app; saving, completion and date cues use no AI. OpenAI Codex assisted development. OpenAI image generation created the synthetic community-notice and suspicious-payment demo photos outside the app. English video narration uses local macOS speech synthesis. The application makes no OpenAI API calls.

## Release checks

Release 7775866 is public. Anonymous health returns its full commit. Thirty Node tests and six focused browser regression groups passed; the latter also passed against the public release with controlled API responses. The final recording uses real public Gemini extraction and planning for both specified Demo Pack photos, including a reviewed Room 2 to Room 4 edit, Hindi guided completion, save/reload/resume and safe fraud-verification steps. YouTube Studio confirmed Unlisted publication. See VERIFICATION.md for evidence and limits. Warmup remains unchanged. Optional SOS is omitted. The event form has not been submitted.
