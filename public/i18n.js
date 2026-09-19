// Explicit keys only. Model output and saved user content never pass through translation.
const entries = {
  title: ["Daywell | हर दिन के काम", "Daywell | Everyday tasks"],
  skip: ["मुख्य हिस्से पर जाएँ", "Skip to main content"],
  home: ["Daywell का मुख्य पेज", "Daywell home"],
  language: ["भाषा", "Language"],
  understand: ["संदेश समझें", "Understand a message"],
  my_day: ["आज के काम", "My day"],
  larger: ["अक्षर बड़े करें", "Larger text"],
  standard: ["सामान्य अक्षर", "Standard text"],
  heading: ["आज किस काम में मदद चाहिए?", "What would you like help with?"],
  intro: [
    "नोटिस की फ़ोटो लें या संदेश लिखें। समझकर अगला कदम चुनें।",
    "Photograph a notice or enter a message. Understand it, then choose your next step.",
  ],
  photo_tab: ["फ़ोटो से पढ़ें", "Read a photo"],
  text_tab: ["लिखें या बोलें", "Type or speak"],
  fraud_tab: ["संदेह वाला संदेश", "Check a suspicious message"],
  photo_heading: ["नोटिस की फ़ोटो चुनें", "Choose a photo of the notice"],
  photo_hint: [
    "एक साफ़ JPEG, PNG या WebP फ़ोटो। अधिकतम 12 MB।",
    "One clear JPEG, PNG or WebP photo. Up to 12 MB.",
  ],
  choose_photo: ["फ़ोटो चुनें", "Choose photo"],
  camera_photo: ["कैमरे से फ़ोटो लें", "Take a photo"],
  photo_alt: ["चुनी गई फ़ोटो का पूर्वावलोकन", "Preview of your selected photo"],
  discard_photo: ["फ़ोटो हटाएँ", "Discard photo"],
  extract: ["फ़ोटो का लिखा पढ़ें", "Read text from photo"],
  photo_privacy: [
    "पढ़ने पर फ़ोटो Google Gemini को भेजी जाएगी। निजी जानकारी ढक दें। फ़ोटो सेव नहीं होगी।",
    "When you request reading, the photo goes to Google Gemini. Cover private details. The photo is not saved.",
  ],
  photo_ready: [
    "फ़ोटो तैयार है। पढ़ने के लिए नीचे बटन चुनें।",
    "Photo ready. Choose the button below to read it.",
  ],
  extracting: [
    "फ़ोटो का लिखा पढ़ रहे हैं। इसमें 45 सेकंड तक लग सकते हैं।",
    "Reading the photo. This can take up to 45 seconds.",
  ],
  review_heading: ["पढ़े गए शब्द जाँच लें", "Review the extracted text"],
  review_hint: [
    "नाम, तारीख और रकम सही करें। आपके अगले क्लिक से पहले योजना नहीं बनेगी।",
    "Correct names, dates and amounts. No plan is made until your next click.",
  ],
  readable: [
    "लिखा पढ़ लिया गया है। भेजने से पहले जाँच लें।",
    "Text was read. Please check it before continuing.",
  ],
  partial: [
    "कुछ हिस्से साफ़ नहीं हैं। नीचे सुधार करें या नई फ़ोटो लें।",
    "Some parts are unclear. Correct them below or try a new photo.",
  ],
  unreadable: [
    "फ़ोटो साफ़ नहीं पढ़ सके। नज़दीक से फिर लें या संदेश लिखें।",
    "We could not read the photo reliably. Try a closer photo or type the message.",
  ],
  too_long: [
    "नोटिस बहुत लंबा है। ज़रूरी हिस्से की छोटी फ़ोटो लें। कुछ भी चुपचाप नहीं हटाया गया है।",
    "The notice is too long. Crop a shorter relevant part. Nothing was silently omitted.",
  ],
  uncertain: ["ये हिस्से जाँचें", "Check these parts"],
  message_label: [
    "यहाँ संदेश लिखें या चिपकाएँ",
    "Type or paste the message here",
  ],
  message_placeholder: ["आपका संदेश", "Your message"],
  message_hint: [
    "हिन्दी या English, दोनों में लिख सकते हैं।",
    "You can enter Hindi or English.",
  ],
  review_confirm: [
    "मैंने शब्द जाँच लिए हैं और इन्हें समझना चाहता हूँ।",
    "I have reviewed the text and want to understand it.",
  ],
  review_required: [
    "पहले पढ़े गए शब्द जाँचें और बॉक्स चुनें।",
    "Review the extracted text and select the confirmation box first.",
  ],
  explain: ["संदेश समझाएँ", "Explain this message"],
  planning: [
    "संदेश का मतलब और ध्यान देने वाली बातें जाँच रहे हैं।",
    "Preparing an explanation and independently checking for cautions.",
  ],
  privacy: [
    "संदेश Google Gemini को भेजा जाएगा। पासवर्ड, भुगतान की जानकारी और निजी बातें न लिखें।",
    "Your message goes to Google Gemini. Leave out passwords, payment details and private information.",
  ],
  not_saved: [
    "आपका संदेश अपने आप सेव नहीं होता।",
    "Your source message is not saved automatically.",
  ],
  ordinary_example: ["सामान्य नोटिस का नमूना", "Ordinary notice example"],
  suspicious_example: [
    "संदेह वाले संदेश का नमूना",
    "Suspicious message example",
  ],
  synthetic: [
    "ये सिर्फ़ जाँच के लिए बनाए गए काल्पनिक उदाहरण हैं।",
    "These are clearly fictional examples for testing.",
  ],
  fraud_hint: [
    "संदेश में क्या चिंता वाली बात है, समझें। यह पक्के तौर पर धोखाधड़ी बताने की सेवा नहीं है।",
    "Look for warning signs and ways to verify independently. This is not a definitive fraud verdict.",
  ],
  result_heading: ["संदेश का मतलब", "What the message says"],
  cautions: ["ध्यान देने वाली बातें", "Things to check"],
  questions: ["यह जानकारी अभी चाहिए", "Details still needed"],
  preparation: ["शुरू करने से पहले", "Possible preparation"],
  preparation_hint: [
    "ये सुझाव हैं, नोटिस की नई शर्तें नहीं।",
    "These are suggestions, not new requirements from the notice.",
  ],
  steps: ["आपके अगले कदम", "Your next steps"],
  risk_pause: [
    "रुककर जाँच करें। अनुरोध पर अमल करने वाले कदम हटा दिए गए हैं। नीचे केवल सुरक्षित जाँच के कदम हैं।",
    "Pause and verify. Steps that act on the request have been withheld. The steps below are for independent verification.",
  ],
  advisory: [
    "जवाब से गलती हो सकती है। ज़रूरी बातें भरोसेमंद व्यक्ति से पक्की करें। कोई बाहरी काम नहीं हुआ है।",
    "This answer can be wrong. Confirm important details with someone you trust. No external action has been performed.",
  ],
  start_guide: ["एक-एक कदम देखें", "Go step by step"],
  overview: ["पूरी योजना देखें", "Back to overview"],
  save_plan: ["योजना सेव करें", "Save this plan"],
  saved: ["योजना इसी ब्राउज़र में सेव हो गई।", "Plan saved in this browser."],
  save_notice: [
    "सेव करने पर जवाब, सावधानियाँ, चुनी तारीखें और कामों की स्थिति इसी ब्राउज़र में रहेंगे। मूल संदेश और फ़ोटो सेव नहीं होंगे।",
    "Saving keeps the plan, cautions, chosen dates and completion in this browser. The original message and photo are not saved.",
  ],
  save_changes: ["बदलाव सेव करें", "Save changes"],
  already_saved: ["सेव की हुई योजना", "Saved plan"],
  draft: ["अभी सेव नहीं की गई", "Not saved yet"],
  resume: ["आगे जारी रखें", "Resume plan"],
  delete_plan: ["योजना हटाएँ", "Delete plan"],
  copy_summary: [
    "भरोसेमंद व्यक्ति के लिए सार कॉपी करें",
    "Copy summary for someone you trust",
  ],
  copied: [
    "सार कॉपी हो गया। आप तय करें किससे साझा करना है।",
    "Summary copied. You decide whom to share it with.",
  ],
  copy_failed: [
    "कॉपी नहीं हो सका। नीचे सार चुनकर कॉपी कर सकते हैं।",
    "Could not copy. You can select and copy the summary below.",
  ],
  share_label: ["साझा करने वाला सार", "Summary to share"],
  share_prefix: [
    "Daywell का सुझाव। यह पक्का धोखाधड़ी का फैसला नहीं है।",
    "Daywell suggestion. This is not a definitive fraud verdict.",
  ],
  clarification_label: ["छूटी हुई जानकारी जोड़ें", "Add the missing detail"],
  clarification_hint: [
    "यह इसी जाँचे गए संदेश से जुड़ा है। नया जवाब बनाने पर दोनों जाँच फिर होंगी।",
    "This stays tied to the reviewed source. Both checks run again when you request an updated plan.",
  ],
  recheck: ["जानकारी जोड़कर फिर जाँचें", "Recheck with this detail"],
  source_needed: [
    "दोबारा जाँचने के लिए मूल संदेश ऊपर लिखें। वह सेव नहीं किया गया था।",
    "Paste the original message above to recheck. It was not saved.",
  ],
  clarification_invalid: [
    "जानकारी 800 अक्षरों तक रखें।",
    "Keep the added detail within 800 characters.",
  ],
  source_changed: [
    "संदेश बदल गया है। पूरी जाँच फिर चलाएँ। पुरानी योजना नहीं बदली है।",
    "The source has changed. Run the full check again. The previous plan is unchanged.",
  ],
  current_step: ["अभी यह कदम", "Current step"],
  step_position: ["कदम {current} / {total}", "Step {current} of {total}"],
  done: ["मैंने यह कर लिया", "I have done this"],
  undo: ["फिर से बाकी रखें", "Mark incomplete"],
  back: ["पिछला कदम", "Back"],
  next: ["अगला कदम", "Next"],
  all_complete: [
    "आपने सभी कदम पूरे किए हैं।",
    "You have marked every step complete.",
  ],
  completion_note: [
    "यह आपकी पुष्टि दर्ज करता है। Daywell ने कोई फ़ोन, भुगतान या बुकिंग नहीं की है।",
    "This records your confirmation. Daywell has not called, paid or booked anything.",
  ],
  due_label: ["तारीख (चाहें तो)", "Due date (optional)"],
  date_for: ["इस कदम की तारीख: {text}", "Due date for: {text}"],
  done_for: ["पूरा हुआ चुनें: {text}", "Mark as done: {text}"],
  undo_for: ["अधूरा चुनें: {text}", "Mark incomplete: {text}"],
  completed: ["पूरा हुआ", "Completed"],
  overdue: ["तारीख निकल गई", "Overdue"],
  due_today: ["आज करना है", "Due today"],
  upcoming: ["आने वाला काम", "Upcoming"],
  no_date: ["तारीख नहीं चुनी", "No due date"],
  date_invalid: ["सही तारीख चुनें।", "Choose a valid date."],
  day_empty: [
    "अभी कोई काम नहीं है। जब चाहें, योजना या काम जोड़ें।",
    "Nothing planned yet. Add a plan or task when you are ready.",
  ],
  day_complete: [
    "आपके सभी सेव किए काम पूरे हैं।",
    "All your saved steps and tasks are complete.",
  ],
  day_counts: [
    "{overdue} की तारीख निकली, {today} आज, {upcoming} आने वाले",
    "{overdue} overdue, {today} due today, {upcoming} upcoming",
  ],
  next_action: ["अगला काम: {text}", "Next useful action: {text}"],
  plans_title: ["सेव की योजनाएँ", "Saved plans"],
  manual_title: ["अपना काम जोड़ें", "Add your own task"],
  task_label: ["काम", "Task"],
  task_placeholder: [
    "जैसे, किसी दोस्त को फ़ोन करना",
    "For example, call a friend",
  ],
  add_task: ["काम जोड़ें", "Add task"],
  delete: ["हटाएँ", "Delete"],
  delete_task: ["काम हटाएँ: {text}", "Delete task: {text}"],
  task_added: ["काम जुड़ गया।", "Task added."],
  task_invalid: [
    "काम लिखें और सही तारीख चुनें।",
    "Enter a task and a valid optional date.",
  ],
  plan_limit: [
    "पहले कोई पुरानी योजना हटाएँ। अधिकतम 30 योजनाएँ सेव हो सकती हैं।",
    "Delete an older plan first. You can save up to 30 plans.",
  ],
  plan_invalid: [
    "योजना पढ़ नहीं पाए। फिर जाँच चलाएँ।",
    "This plan could not be read. Please run the check again.",
  ],
  storage_notice: [
    "जानकारी सिर्फ़ इसी ब्राउज़र में रहती है। तारीखें ऐप खुला होने पर दिखती हैं। कोई बैकग्राउंड रिमाइंडर नहीं आता।",
    "Data stays in this browser. Date cues appear while the app is open. No background reminders are sent.",
  ],
  storage_failed: [
    "बदलाव ब्राउज़र में सेव नहीं हुए। पेज खुला रखें, दोबारा खोलने पर बदलाव खो सकते हैं।",
    "Changes could not be saved. Keep this page open; changes may be lost on reload.",
  ],
  storage_unavailable: [
    "ब्राउज़र सेव करने की सुविधा नहीं दे रहा। इस पेज पर काम कर सकते हैं, पर दोबारा खोलने पर काम नहीं रहेंगे।",
    "Browser storage is unavailable. You can work on this page, but changes will not survive reload.",
  ],
  storage_corrupt: [
    "पुरानी जानकारी पढ़ नहीं पाए। उसे मिटाया या बदला नहीं गया है। सेव करने के लिए नीचे जानकारी मिटाएँ, या अभी सिर्फ़ इस पेज पर काम करें।",
    "Saved data could not be read. It has not been overwritten. Clear it below to save again, or continue in this page only.",
  ],
  storage_migrated: [
    "पुराने काम सुरक्षित मिल गए। अगले बदलाव पर नए रूप में सेव होंगे।",
    "Your previous tasks were recovered. They will use the new format on your next saved change.",
  ],
  clear: ["सेव की जानकारी मिटाएँ", "Clear saved data"],
  clear_question: [
    "सभी सेव की योजनाएँ, काम और सेटिंग मिट जाएँगे। इसे वापस नहीं किया जा सकेगा।",
    "This removes saved plans, tasks and preferences. This cannot be undone.",
  ],
  confirm_clear: ["हाँ, मिटाएँ", "Yes, clear data"],
  cancel: ["रहने दें", "Cancel"],
  cleared: ["सेव की जानकारी मिट गई।", "Saved data cleared."],
  clear_failed: [
    "ब्राउज़र ने जानकारी मिटाने नहीं दी। साइट की सेटिंग से मिटाएँ।",
    "The browser could not clear data. Use your browser’s site settings.",
  ],
  speak: ["बोलकर लिखें", "Speak to type"],
  stop_dictation: ["लिखना रोकें", "Stop dictation"],
  listen: ["सुनें", "Listen"],
  stop_reading: ["रोकें", "Stop reading"],
  voice_notice: [
    "बोलकर लिखने में ब्राउज़र ऑनलाइन सेवा इस्तेमाल कर सकता है। भेजने से पहले शब्द जाँचें।",
    "The browser may use an online service for dictation. Review the words before sending.",
  ],
  listening: [
    "सुन रहे हैं। बोलें, फिर लिखना रोकें चुनें।",
    "Listening. Speak, then choose Stop dictation.",
  ],
  dictation_review: [
    "बोलकर लिखना रुक गया। भेजने से पहले शब्द जाँचें।",
    "Dictation stopped. Review the words before sending.",
  ],
  voice_unsupported: [
    "इस ब्राउज़र में बोलकर लिखना नहीं है। आप लिख या चिपका सकते हैं।",
    "Dictation is unavailable in this browser. You can type or paste.",
  ],
  voice_denied: [
    "माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र सेटिंग में अनुमति दें या लिखें।",
    "Microphone permission was denied. Allow it in browser settings or type instead.",
  ],
  voice_silence: [
    "आवाज़ नहीं सुनाई दी। फिर कोशिश करें या लिखें।",
    "No speech was heard. Try again or type instead.",
  ],
  voice_network: [
    "आवाज़ की सेवा से कनेक्शन नहीं हुआ। लिखकर आगे बढ़ सकते हैं।",
    "The speech service could not connect. You can continue by typing.",
  ],
  voice_failed: [
    "बोलकर लिखना शुरू नहीं हुआ। लिखकर आगे बढ़ सकते हैं।",
    "Dictation could not start. You can continue by typing.",
  ],
  voice_missing: [
    "चुनी हुई भाषा की आवाज़ उपलब्ध नहीं है। स्क्रीन पर जवाब पढ़ सकते हैं।",
    "No voice is available for the selected language. You can read the answer on screen.",
  ],
  speech_unsupported: [
    "इस ब्राउज़र में पढ़कर सुनाना नहीं है।",
    "Read aloud is unavailable in this browser.",
  ],
  reading: [
    "पढ़कर सुना रहे हैं। रोकने के लिए रोकें चुनें।",
    "Reading aloud. Choose Stop reading to stop.",
  ],
  reading_done: ["पढ़ना पूरा हुआ।", "Reading finished."],
  reading_stopped: ["पढ़ना रुक गया।", "Reading stopped."],
  speech_failed: [
    "पढ़कर सुनाना शुरू नहीं हुआ। स्क्रीन पर पढ़ सकते हैं।",
    "Read aloud could not start. You can read on screen.",
  ],
  how: ["यह जवाब कैसे तैयार हुआ", "How this was prepared"],
  how_hint: [
    "नीचे असली जाँचों की स्थिति है। कोई छिपी सोच या निजी लॉग नहीं दिखाए जाते।",
    "These are actual workflow statuses. Hidden reasoning and private logs are not shown.",
  ],
  validate_upload: ["फ़ोटो की जाँच", "Photo validation"],
  extract_notice: ["फ़ोटो से लिखा पढ़ा", "Notice extraction"],
  validate_extraction: ["पढ़े हुए लिखे की जाँच", "Extraction validation"],
  validate_input: ["संदेश की जाँच", "Input validation"],
  explain_and_extract: ["मतलब और तैयारी", "Explanation and preparation"],
  review_safety: ["अलग सावधानी जाँच", "Independent safety review"],
  compose_plan: ["सुझाव जोड़े", "Plan composition"],
  validate_output: ["अंतिम जवाब की जाँच", "Final validation"],
  node_completed: ["पूरी हुई", "Completed"],
  node_failed: ["पूरी नहीं हुई", "Failed"],
  node_blocked: ["रोक दी गई", "Blocked"],
  seconds: ["सेकंड", "seconds"],
  retry: ["फिर कोशिश करें", "Try again"],
  network: [
    "कनेक्शन नहीं हुआ। इंटरनेट जाँचें। आपका लिखा यहीं है।",
    "Could not connect. Check your internet. Your text is still here.",
  ],
  timeout: [
    "ज़्यादा समय लग गया। आपका लिखा यहीं है। फिर कोशिश करें।",
    "This took too long. Your text is still here. Please retry.",
  ],
  planning_failed: [
    "अभी पूरा जवाब नहीं बन सका। दोनों जाँच पूरी होना ज़रूरी है। आपका लिखा यहीं है। फिर कोशिश करें।",
    "We could not finish both required checks. Your text is still here. Please try again.",
  ],
  extraction_failed: [
    "फ़ोटो पढ़ नहीं सके। फ़ोटो यहीं है। फिर कोशिश करें या लिखें।",
    "We could not read the photo. It is still here. Retry or type the message.",
  ],
  busy: [
    "अभी व्यस्त है। एक मिनट रुककर फिर कोशिश करें।",
    "Busy right now. Wait a minute and try again.",
  ],
  input_invalid: [
    "1 से 4,000 अक्षरों का संदेश लिखें।",
    "Enter a message of 1 to 4,000 characters.",
  ],
  request_invalid: [
    "जानकारी पढ़ नहीं पाए। फिर कोशिश करें।",
    "We could not read the request. Try again.",
  ],
  request_size: [
    "जानकारी बहुत बड़ी है। छोटा संदेश या छोटी फ़ोटो चुनें।",
    "The request is too large. Choose a shorter message or smaller photo.",
  ],
  image_invalid: [
    "यह फ़ोटो नहीं खुल सकी। JPEG, PNG या WebP चुनें।",
    "This image could not be read. Choose a JPEG, PNG or WebP.",
  ],
  image_size: [
    "फ़ोटो बड़ी है। छोटा हिस्सा काटकर फिर चुनें।",
    "The photo is too large. Crop a smaller portion and try again.",
  ],
  image_dimensions: [
    "फ़ोटो का आकार सही नहीं है। 1600 पिक्सेल तक की तैयार फ़ोटो चाहिए।",
    "The prepared image must have a longest edge of at most 1600 pixels.",
  ],
  original_size: [
    "मूल फ़ोटो 12 MB से छोटी होनी चाहिए।",
    "The original photo must be smaller than 12 MB.",
  ],
  original_dimensions: [
    "फ़ोटो का आकार बहुत बड़ा या बहुत छोटा है। छोटा हिस्सा चुनें।",
    "The photo dimensions are too large or too small. Choose a smaller crop.",
  ],
  same_origin: [
    "Daywell की अपनी साइट से कोशिश करें।",
    "Please use Daywell directly.",
  ],
  not_found: ["यह पेज नहीं मिला।", "Page not found."],
  page_failed: [
    "पेज नहीं खुल सका। दोबारा खोलें।",
    "The page could not load. Please refresh.",
  ],
  footer: [
    "Daywell से गलती हो सकती है। यह इलाज, पैसों या आपातकालीन सेवा का विकल्प नहीं है।",
    "Daywell can make mistakes. It does not replace medical, financial or emergency services.",
  ],
  noscript: [
    "Daywell इस्तेमाल करने के लिए JavaScript चालू करें।",
    "Enable JavaScript to use Daywell.",
  ],
};
export const translations = {
  hi: Object.fromEntries(Object.entries(entries).map(([k, v]) => [k, v[0]])),
  en: Object.fromEntries(Object.entries(entries).map(([k, v]) => [k, v[1]])),
};
let locale = "hi";
export function getLocale() {
  return locale;
}
export function t(key, values = {}, language = locale) {
  const value = translations[language]?.[key];
  if (value === undefined) throw new Error(`Missing translation key: ${key}`);
  return value.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
}
export function setLocale(value) {
  locale = value === "en" ? "en" : "hi";
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.title = t("title");
  for (const node of document.querySelectorAll("[data-i18n]"))
    node.textContent = t(node.dataset.i18n);
  for (const node of document.querySelectorAll("[data-i18n-placeholder]"))
    node.placeholder = t(node.dataset.i18nPlaceholder);
  for (const node of document.querySelectorAll("[data-i18n-label]"))
    node.setAttribute("aria-label", t(node.dataset.i18nLabel));
}
