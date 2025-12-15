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
```

### 2. Install Dependencies
You need to install dependencies for **both** the client and server.

#### Install Server Dependencies
```bash
cd server
npm install
```

#### Return to root and install Client Dependencies
```bash
cd ../client
npm install
```

### 3. Environment Variables (.env)
Create a .env file in the server/ folder and a .env.local file in the client/ folder.

#### Server (server/.env):
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_ai_key
# Clerk Auth Keys (Backend)
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

#### Client (client/.env.local):
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
# Clerk Auth Keys (Frontend)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 4. Run the App
Open two separate terminals to run the frontend and backend simultaneously.

#### Terminal 1 (Backend):

```bash
cd server
npm start
The server will start on port 5000.
```

#### Terminal 2 (Frontend):

```bash
cd client
npm run dev
The frontend will start on port 3000.
```
Visit http://localhost:3000 to start hiring!