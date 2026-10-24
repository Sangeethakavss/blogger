# 📖 Blogify — Full-Stack Next.js & MERN Blog Platform

A modern, responsive, and secure **full-stack blogging platform** built using **Next.js (App Router)** for the frontend and **Node.js, Express.js, and MongoDB** for the backend. Styled with **Poppins** typography throughout the application, featuring JWT authentication, author-restricted CRUD permissions, real-time keyword search, category filtering, numbered pagination, genuine real-time view tracking, interactive likes and comments, and a refined user profile dashboard.

---

## ✨ Key Features & Updates

### 🔐 Authentication & Authorization
- **Clean JWT Authentication**: User registration and login with bcrypt password hashing (10 salt rounds).
- **Pure Email & Password Flow**: Clean authentication design without third-party social media logins or bypass accounts.
- **Access Control & Author Protection**: Users can edit or delete **only their own blog posts** (enforced both at the Express controller level with `403 Forbidden` and conditionally in the Next.js UI).
- **Route Protection**: Client route guards ensuring only authenticated users can author or manage posts.

### 📈 Genuine View Tracking
- **View Count Functionality**: Zero fake or inflated counts! Each blog starts with zero views, and view increments are handled via a dedicated, idempotent-safe endpoint (`POST /api/blogs/:id/view`) so page reloads or component re-renders never double-count.
- **Author's Total Views**: The user profile calculates and displays the sum of all views accumulated across all published articles by that author.

### 👤 Refined Profile Dashboard
- **Corner Avatar Edit Button**: An edit camera badge is positioned directly at the bottom-right corner of the profile photo. Users can click to select and upload a new profile picture.
- **No Avatar URL Input**: The manual "Avatar Image URL" text box has been completely removed in favor of the direct avatar button.
- **Settings Module Removed**: The profile page is decluttered to focus purely on author identity and blog post management.

### 🎨 Poppins Typography
- **Poppins Font**: Applied globally across the entire project for all headings, body text, badges, navigation, and inputs.

### 📝 Blog Management (Full CRUD)
- **Create**: Catchy title, category selection, rich text formatting toolbar (headings, bold, italic, underline, lists, quotes, links), drag-and-drop cover image upload, or curated photography presets.
- **Read & View**: Scenic cover images, reading time calculation (e.g., `5 min read`), author avatar & bio, view counters, formatted paragraphs, and blockquotes.
- **Edit**: Pre-populated edit view allowing authors to update title, category, content, cover image, and status (`Published` vs `Draft`).
- **Delete**: Permanent deletion with a clean confirmation modal to prevent accidental data loss.

### 🔍 Discovery & Interaction
- **Keyword Search**: Real-time query matching across blog titles, excerpts, and body content.
- **Category Filtering**: Filter across 7 categories (`Technology`, `Lifestyle`, `Travel`, `Health`, `Food`, `Business`, `Inspiration`) with active pill states and live post counters.
- **Sorting Options**: Sort by *Newest First*, *Oldest First*, *Most Popular*, and *Most Views*.
- **Pagination**: Numbered pagination controls (`< 1 2 3 >`) with responsive navigation.
- **Social Interactions**: Interactive post liking with live count toggles, and reader comments.

---

## 🏗️ Architecture & Project Structure

```
Blogify/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             # Mongoose connection with automatic MongoMemoryServer fallback
│   │   ├── controllers/
│   │   │   ├── authController.js # Register, login, getMe, updateProfile
│   │   │   └── blogController.js # CRUD, category meta, search, user blogs, likes, comments, atomic views
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js # JWT verification
│   │   │   ├── errorMiddleware.js# 404 handler and unified JSON error handling
│   │   │   └── validateMiddleware.js # Validation rules
│   │   ├── models/
│   │   │   ├── User.js           # User schema with bcrypt pre-save hook
│   │   │   └── Blog.js           # Blog schema with reading time & search indexes
│   │   ├── routes/
│   │   │   ├── authRoutes.js     # /api/auth routes
│   │   │   └── blogRoutes.js     # /api/blogs routes
│   │   └── server.js             # Express app setup, CORS, API routes
│   ├── .env.example
│   ├── .env
│   └── package.json
├── frontend/                     # Next.js 14 (App Router)
│   ├── app/
│   │   ├── layout.jsx            # Root layout configuring Poppins font globally
│   │   ├── globals.css           # Global Tailwind and Poppins styles
│   │   ├── page.jsx              # Home page (Hero, quote card, feature pillars, stories)
│   │   ├── blogs/page.jsx        # "Latest Blogs" exploration page with filters & search
│   │   ├── blog/[id]/page.jsx    # Blog detail view with views count, likes, comments
│   │   ├── create/page.jsx       # Blog creation form with rich toolbar & photo presets
│   │   ├── edit/[id]/page.jsx    # Author-protected edit form
│   │   ├── profile/page.jsx      # User dashboard with corner avatar edit & views counts
│   │   ├── login/page.jsx        # Clean "Welcome Back" screen (email/password)
│   │   ├── register/page.jsx     # "Create Your Account" screen
│   │   ├── categories/page.jsx   # Curated category exploration grid
│   ├── components/
│   │   ├── Navbar.jsx            # Sticky navigation with search & profile dropdown
│   │   ├── Footer.jsx            # Platform links and newsletter
│   │   ├── BlogCard.jsx          # Responsive card with views counter & metadata
│   │   ├── CategoryPills.jsx     # Interactive category filters with counters
│   │   ├── Pagination.jsx        # Numbered page navigation (< 1 2 3 >)
│   │   └── DeleteModal.jsx       # Accessible confirmation modal
│   ├── context/
│   │   └── AuthContext.jsx       # Next.js client-side authentication provider
│   ├── lib/
│   │   └── api.js                # Axios client with JWT interceptor
│   ├── next.config.js            # Next.js rewrites proxying /api to Express backend
│   ├── tailwind.config.js        # Tailwind with Poppins typography extension
│   └── package.json
├── test-suite.js                 # Automated 15-point E2E integration test runner
├── package.json                  # Root orchestration scripts
└── README.md
```

---

## ⚡ Quick Start Guide (For Cloned Repositories)

Follow these simple steps to run the application on your computer:

### 📋 Prerequisites
- **Node.js**: Version `18.x` or higher installed ([Download Node.js](https://nodejs.org/)).
- **Git**: Installed.
- *(Note: You do **NOT** need MongoDB installed! If no local MongoDB is running, the project automatically boots an in-memory database).* 

---

### Step 1: Open the Project Directory
Open your terminal (PowerShell, Command Prompt, or VS Code terminal) in the cloned project folder:
```bash
cd Blogify
```

---

### Step 2: Set Up Backend Environment File
Copy the example environment file to create `backend/.env`:

- **Windows (PowerShell)**:
  ```powershell
  Copy-Item backend\.env.example backend\.env
  ```
- **Windows (Command Prompt / CMD)**:
  ```cmd
  copy backend\.env.example backend\.env
  ```
- **Mac / Linux**:
  ```bash
  cp backend/.env.example backend/.env
  ```

---

### Step 3: Install Dependencies
Run the install command from the root directory to install packages for root, backend, and frontend all at once:
```bash
npm run install-all
```

*(Alternatively, if you prefer installing manually in each folder:)*
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

---

### Step 4: Start the Application

You can start both backend and frontend together with a single command from the root folder:
```bash
npm run dev
```

---

### 🌐 Open in Your Browser
Once started, open:
- **Frontend App**: **[http://localhost:3000](http://localhost:3000)**
- **Backend API Health**: **[http://localhost:5000/api/health](http://localhost:5000/api/health)**

---

### 💡 Alternative: Running in Two Separate Terminals
If you prefer running backend and frontend in separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
*(Backend will start on port `5000`)*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*(Frontend will start on port `3000`)*

---

## 🔑 User Accounts & Authentication

Click **"Sign Up"** on the website to create your own account instantly with your name, email, and password. You can upload or remove your profile picture at any time from your Profile settings.
