# Main challenge submission review

Do not submit automatically. Deadline: 19 September 2026, 2:15 PM IST. Current main rules permit three attempts. Confirm all fields before the participant submits.

## Form fields

1. **Challenge:** AI For Senior Citizens
2. **Public repository:** https://github.com/deevyanshoo/promptwars-main
3. **Working deployed URL:** https://promptwars-main-589901835092.asia-south1.run.app
4. **Publicly playable demo-video URL:** Pending recording and verified upload. Do not substitute a fabricated URL.
5. **Changes/updates description:**

Daywell is a Hindi-first daily organizer for older adults. Photograph a notice, explicitly request extraction, review and correct the words, then receive a plain-language plan with independent cautions. Follow one guided step at a time, choose dates, explicitly save, reload and resume. The real backend DAG runs explanation and safety review concurrently and waits for both. Substantial risk replaces candidate instructions with safe verification steps and removes preparation. The app includes English switching, larger text, optional browser speech, manual tasks, local due-date cues, honest retry states and validated browser-local storage. Photo and request limits, structured output validation and shared AI admission keep the workflow bounded. No external actions, emergency dispatch or automatic reminders are claimed.

6. **Actual GenAI services and where used:**

Google Gemini on Vertex AI is the only GenAI service. The configured model is gemini-3.8-flash, global endpoint, through @google/genai 2.23.0 with thinking level LOW. Photo extraction uses one structured multimodal call to transcribe a validated image and identify uncertainty. After user review, two independent parallel calls explain the original message and assess cautions. Deterministic DAG composition waits for both, applies risk-based replacement and validates the final plan. Hindi or English output uses these same calls, with no extra translation call. Browser SpeechRecognition and SpeechSynthesis are separate browser features, not Gemini audio understanding. Cloud Run hosts the Node application. Saving, guided completion and date cues use no AI calls.

## Release checks

The initial release is public and its photo-to-Hindi-plan, save/reload/resume and fraud workflows have been verified. Final commit and video will be recorded after release packaging. See VERIFICATION.md for actual results and limits. Warmup remains unchanged. Optional SOS is omitted. The event form has not been submitted.
