# GradGuide Course Recommendation Assistant

- **Live Deployed App:** https://gradguide-course-assistant.vercel.app
- **GitHub Repository:** https://github.com/Doli16/gradguide-course-assistant
- **Video Walkthrough:** [INSERT_YOUR_LOOM_OR_YOUTUBE_LINK_HERE]

---

##  Problem Statement & Solution
During study-abroad counselling calls, recommendations vary depending on which counsellor a student speaks to. This application acts as a **live Google Meet companion side panel** that standardizes course recommendations with dynamic scoring, explicit rationale badges, and real-time financial transparency.

---

##  4 Core Features Built for Counsellors

1. **Automated Match Rationale Badges ("Why This Fits"):** Evaluates candidate metrics dynamically to generate transparent matching reasons (budget compliance, GPA thresholds, language scores).
2. **Live Objection Handling Controls:** One-click toggles allowing counsellors to handle live student objections during calls (+10% Flex Budget and GRE waivers) without editing student profile data.
3. **Multi-Currency & Total Living Expense Estimator:** Converts costs into INR (₹ Lakhs), USD ($), EUR (€), or GBP (£) using live real-time FX market rates while evaluating total study costs (Tuition + Living Expenses).
4. **One-Click Student Shortlist Exporter:** Compiles shortlisted programs into a formatted text summary ready to be copied into WhatsApp or email follow-ups.

---

##  Tech Stack & Architecture
- **Frontend Framework:** React.js (Vite)
- **State & DOM Management:** React Hooks (`useState`, `useMemo`, `useEffect`), Browser Clipboard DOM API
- **Live FX API:** REST Integration via `open.er-api.com` with benchmark fallback safety
- **Data Layer:** Structured JSON Knowledge Base (`courses.json`) featuring 25 accredited universities across the USA, UK, Canada, Germany, and Australia.

---

##  Future Product Roadmap
- **Persistent Student CRM & Session History:** Integrate PostgreSQL / Firebase backend to save student call records, counsellor notes, and shortlisted programs directly to GradGuide's internal database post-call.
