# VoteFlow - Digital Election & Recommendation Portal

![React](https://img.shields.io/badge/React-19.2.0-blue?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.3.1-purple?style=flat&logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-12.9.0-orange?style=flat&logo=firebase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.19-38B2AC?style=flat&logo=tailwind-css)

**VoteFlow** (originally the NSS SCE PR Selection and POC Recommendation Portal) is a highly secured, real-time digital voting and administrative orchestration application. Designed to manage leadership elections at scale, VoteFlow centralizes candidate voting, administrative oversight, and hierarchical access controls using modern frontend libraries and cloud infrastructure.

This repository serves as a **public showcase**. To ensure privacy, the database is pre-hydrated with anonymized, mock student data that replicates the exact architectural structure of the genuine deployment. 

## 🚀 Key Features & Architectural Highlights

- **Role-Based Access Control (RBAC):** Hierarchical user flows managed natively through Firebase Authentication. The system distinguishes strictly between standard `User`, `Admin`, and `Superadmin` credentials, protecting sensitive API routes and dashboard views.
- **Dual Verification Voting Mechanism:** Facilitates both direct Candidate Voting (PR Selection) and secondary Recommendation Polling (POC) simultaneously, with automated lockout logic to prevent duplicate or overriding submissions.
- **Dynamic Administrative Orchestration:** 
  - *Superadmins* have sweeping permissions to globally enable or disable voting platforms, control authentication flows real-time, and manage lower-level `Admins`.
  - *Admins* possess project-level scopes, allowing them to track live vote streaming and manipulate granular dashboard data efficiently. 
- **Real-Time Data Streaming:** Built on **Firebase/Firestore**, integrating secure `.onSnapshot()` listeners for real-time leaderboards, data aggregation, and status updates across thousands of prospective documents without manual refreshes.
- **Automated Communication Systems:** Employs a Node.js backend integrating **Nodemailer** to fire transactional, zero-latency email receipts the moment a secure transaction finishes execution on the frontend.
- **Optimized UI/UX Design:** Engineered fully responsive layouts mapped beautifully onto **Tailwind CSS**. Enhanced with smooth DOM transitions (via `lucide-react` assets) and conditional styling to provide a premier, premium user experience.

## 🛠️ Technology Stack

- **Frontend Core:** React, Vite, React Router DOM
- **UI & Styling:** Tailwind CSS, Tailwind Merge, CLSX
- **Backend & Database:** Firebase Authentication, Firestore (NoSQL Document Store)
- **Node Infrastructure:** Firebase-Admin, Nodemailer, CSV-Parser (for DB seeding pipelines)

## 💻 Local Testing & Showcase Navigation

Because this repository has been prepared as a showcase, the authentication constraints have been temporarily opened. Anyone testing locally can run the system and simulate the full voting experience.

```bash
# 1. Clone the repository
git clone git@github.com:alsoankit/VoteFlow.git

# 2. Install dependencies securely
npm install

# 3. Start the Vite development server
npm run dev
```

### Try it out!
1. Open the local address in your browser.
2. Click **Sign in with Google**. (The showcase branch auto-provisions a simulated mock profile for external visitors to securely traverse the UI).
3. View the candidate feeds, observe the dynamic rendering rules, and cast simulated votes.

---

> *Developed with an emphasis on production-ready security rules, efficient state management, and modern component architecture.*
