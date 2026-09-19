# Daywell demo and jury explanation

Target 90 to 120 seconds. Use the public main app and only the synthetic notice. No real personal data. Published Unlisted: https://youtu.be/eXG8rFQDzvY. The final 119-second recording uses release 7775866, the two requested Demo Pack photos and English narration.

## Suggested walkthrough

**0:00 to 0:12**
“Daywell helps older adults turn a notice into a practical plan. It starts in Hindi, with readable text and clear controls. English and larger text are available.”
Show the main task without a marketing page.

**0:12 to 0:30**
“Choose a notice photo. It stays local until I ask Google Gemini to read it. The extracted words are editable. I will change Room 2 to Room 4 as a reviewed correction, then confirm that I have reviewed the text.”
Choose the clearly fictional community notice, extract, edit the room and confirm review.

**0:30 to 0:48**
“Now Daywell explains the corrected notice in Hindi. One Gemini branch explains the source, while another independently checks the original text for cautions. Both must finish before a plan appears.”
Show the explanation, cautions and real node-status disclosure. Use Listen only if a matching voice is available. The browser voice is separate from Gemini.

**0:48 to 1:12**
“I can take one step at a time. Done records my confirmation; it does not make a booking or call. I explicitly save the plan, reload, and continue from the next unfinished step. Dates are chosen by me. There are no background notifications.”
Complete a guided step, return to overview, save, reload and resume. Briefly show Undo.

**1:12 to 1:38**
“The same workflow checks a suspicious message. These are specific warning signs, not a guaranteed fraud verdict. At substantial risk, Daywell replaces risky actions with independent verification steps and removes preparation that could help someone comply.”
Upload 03-suspicious-payment.png, extract its words, confirm review and run the real workflow. Show cautions, safe steps and optional copyable summary.

**1:38 to 1:50**
“Plans stay in this browser only. The app has bounded requests, strict structured-output validation and honest retry states. It cannot dispatch help, contact services or guarantee accuracy. The core is live, with an executable DAG and tested save-and-resume.”
Show the deployed URL. Do not demonstrate or claim SOS, an ambulance integration, a mobile app or calendar notifications.

## Short jury explanation

Older adults often need more than an answer: they need to read a notice, check uncertain details, decide what to do, and remember where they stopped. Daywell connects those steps with an explicit human review boundary and a saved daily plan.

A photo-extraction DAG validates the upload, calls Gemini and validates the transcription. After the user reviews it, a separate planning DAG runs explanation and independent safety review concurrently on the same original source. Deterministic composition waits for both branches and replaces risky actions when necessary. Validated results become a plan only after both checks succeed. Saving and completion are explicit browser actions, not model side effects.

The implementation is Node.js 22 and vanilla JavaScript, with one pinned Gemini SDK dependency. Hindi-first accessibility, safe text rendering, bounded provider calls, visible storage failures and testable injected workflows serve the intended users. Limits are explicit: cloud model errors remain possible, browser speech varies, local data does not sync, and no external action or emergency dispatch is performed.
