# 🚀 TalentScout AI - Intelligent ATS Dashboard

> **A Next.js & Express application that leverages Google Gemini AI to automate resume screening, ranking, and candidate communication.**


## 💡 The Problem
Recruiters spend seconds scanning resumes. Good candidates get lost in the pile, and manual data entry is slow. ATS systems are often clunky and expensive.

## 🛠️ The Solution
TalentScout allows recruiters to:
1.  **Bulk Upload Resumes:** Drag & drop multiple PDFs at once.
2.  **AI Analysis:** Google Gemini parses the PDF, extracts key skills, generates a match score (0-100), and assigns a Tier (S, A, B, F).
3.  **Visual Ranking:** Candidates are automatically sorted into a Kanban-style Tier List.
4.  **One-Click Outreach:** Auto-generates personalized email drafts based on the candidate's specific profile and opens your default mail client.

## ⚡ Technical Highlights (Engineering Decisions)
* **Decoupled Architecture:** Frontend (Next.js) and Backend (Express/Node) are deployed separately for scalability.
* **In-Memory Processing:** Uses `multer` memory storage to parse PDFs in RAM, avoiding ephemeral disk storage issues on cloud platforms (Render/Heroku).
* **Throttled Queue System:** Implemented a custom Recursive Queue on the frontend to handle Bulk Uploads while strictly adhering to Google Gemini's Free Tier API rate limits (15 RPM), preventing 429 errors.
* **Optimistic UI:** State management ensures the UI feels instant while background processes handle the heavy AI lifting.

## 🧰 Tech Stack

### Frontend
* **Framework:** Next.js 14 (App Router)
* **Styling:** Tailwind CSS + Framer Motion (Animations)
* **Components:** Lucide React, Recharts (Radar Charts)
* **Auth:** Clerk

### Backend
* **Runtime:** Node.js + Express.js
* **Database:** MongoDB Atlas (Mongoose)
* **AI:** Google Gemini (2.5 Flash Model)
* **Parsing:** pdf-parse (v2)

---

## 🚀 Getting Started Locally

### 1. Clone the Repo
```bash
git clone [https://github.com/kishan59/talentscout-ai.git](https://github.com/kishan59/talentscout-ai.git)
cd talentscout-ai