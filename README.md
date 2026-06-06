# CampusGenie AI

CampusGenie AI is a premium campus operations platform designed to help students and administrators manage complaints, maintenance requests, lost & found records, policies, and dashboard analytics under a dark-themed glassmorphism interface.

## Project Structure
```
CampusGenieAI/
├── frontend/          # React (Vite) + Tailwind CSS + Recharts
└── backend/           # Node.js + Express.js + Supabase PostgreSQL
```

---

## 🛠️ Backend Setup & Run

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

3. Update the `.env` file with your **Supabase URL**, **Service Role Key**, and **Anon Key**.

4. Run the database setup commands found in [database.sql](file:///d:/OneDriveOfDdrive/Projects/CampusGenieAI/backend/database.sql) inside your Supabase SQL Editor.

5. Start the server:
   ```bash
   npm start
   ```
   The backend server will run on `http://localhost:5000`.

---

## 💻 Frontend Setup & Run

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend application will start on `http://localhost:5173`.
"# AI-FOR-IMPACT-2.0" 
