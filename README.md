# 🌿 GreenIntel AI — IGBC Document Evaluation System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.9.0-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Groq](https://img.shields.io/badge/Groq_LLM-Powered-f05023?style=for-the-badge)](https://groq.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

An intelligent, AI-powered compliance analysis and document classification platform built specifically for the **Indian Green Building Council (IGBC)** rating systems. **GreenIntel AI** automates document processing, categorizes evidence into IGBC credits, extracts core metrics, evaluates compliance using LLMs, and offers interactive project workspace intelligence.

---

## 📌 Table of Contents

- [Overview & Problem Statement](#-overview--problem-statement)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Backend Installation](#backend-installation)
  - [Frontend Installation](#frontend-installation)
- [API Reference](#-api-reference)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 💡 Overview & Problem Statement

Evaluating green building documents for IGBC certification manually is time-consuming, prone to human error, and requires searching through hundreds of pages of technical submittals, energy models, design drawings, and waste management manifests.

**GreenIntel AI** solves this by:
1. **Automating Classification**: DistilBERT NLP model classifies PDF document uploads into relevant IGBC credit categories.
2. **Text & Data Extraction**: Parses complex PDF submittals automatically via PyMuPDF.
3. **Automated Compliance Verification**: Uses Groq LLM API to score documents against IGBC standards and provide detailed recommendations.
4. **Interactive AI Workspace Chat**: Project team members can query their document hub using conversational AI tuned for green building submittals.
5. **Analytics & Progress Tracking**: Provides visual breakdown of points earned, pending compliance, category distribution, and printable evaluation reports.

---

## ✨ Key Features

- 📑 **Document Classifier**: Automated classification using fine-tuned Hugging Face DistilBERT / PyTorch models.
- ⚡ **AI Compliance Assessment**: Instant credit evaluation with scoring breakdown, status indicators (Compliant / Non-Compliant / Partial), and action items.
- 🏗️ **Multi-Project Hub**: Create, manage, and track green building projects under different IGBC rating tool categories.
- 💬 **Project AI Assistant**: Contextual chatbot powered by Groq to answer project-specific document and credit queries.
- 📊 **Analytics Dashboard**: Interactive charts showing total credit progress, compliance rates, category distribution, and project history.
- 🔐 **Dual Auth Support**: Secure JWT authentication with bcrypt password hashing alongside Google OAuth integration.
- 🌐 **Robust Storage**: Async MongoDB Atlas database connection with automatic fallback logging.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **State & Routing**: React Router v7, React Context API
- **Icons & Animations**: Lucide React, Framer Motion
- **Visualizations**: Recharts
- **Authentication**: `@react-oauth/google`

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn
- **Database**: MongoDB Atlas (via Motor / PyMongo async client)
- **Machine Learning & NLP**: PyTorch, Hugging Face Transformers (DistilBERT)
- **PDF Extraction**: PyMuPDF (`fitz`)
- **LLM Integration**: Groq API (`groq/compound-mini` or `llama-3.3-70b-versatile`)
- **Authentication & Security**: PyJWT, Passlib (Bcrypt)

---

## 🏗️ System Architecture

```
                 +-------------------------------------------------+
                 |                React Frontend                   |
                 |      (Vite + React Router + Recharts)           |
                 +------------------------+------------------------+
                                          |
                                 REST API | JSON / Multipart
                                          v
                 +-------------------------------------------------+
                 |                FastAPI Backend                  |
                 +----+-------------------+-------------------+----+
                      |                   |                   |
                      v                   v                   v
            +-------------------+ +---------------+ +-------------------+
            | DistilBERT Model  | | PyMuPDF (fitz)| | Groq AI LLM Engine|
            | Document Classify | | Text Extraction| | Evaluation / Chat |
            +-------------------+ +---------------+ +-------------------+
                      |                   |                   |
                      +-------------------+-------------------+
                                          |
                                          v
                              +-----------------------+
                              | MongoDB Atlas DB      |
                              | Projects, Documents,  |
                              | Evaluations, Users    |
                              +-----------------------+
```

---

## 📁 Project Directory Structure

```
igbc-document-evaluation/
├── backend/                  # FastAPI Backend Application
│   ├── database/             # MongoDB database connections & models
│   ├── models/               # Pydantic schemas & ML model artifacts
│   ├── routes/               # FastAPI route controllers
│   │   ├── analytics_routes.py
│   │   ├── auth_routes.py
│   │   ├── document_routes.py
│   │   ├── evaluation_routes.py
│   │   ├── google_auth_routes.py
│   │   └── project_routes.py
│   ├── services/             # Core business logic & LLM integrators
│   │   ├── compliance_checker.py
│   │   ├── information_extractor.py
│   │   └── project_chat_service.py
│   ├── utils/                # PDF parsing, NLP classifiers, JWT handlers
│   ├── uploads/              # Local storage for uploaded document files
│   ├── app.py                # Server entry point & startup handlers
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Backend environment variables
│
├── frontend/                 # React 19 Frontend Web App
│   ├── src/
│   │   ├── components/       # UI components (Buttons, Selects, Modals)
│   │   ├── context/          # React Contexts (Auth, Theme, Google Auth)
│   │   ├── pages/            # Application routes (Home, Projects, Workspace, Analytics)
│   │   ├── services/         # Axios API clients
│   │   └── types/            # TypeScript interfaces
│   ├── package.json          # Node dependencies & scripts
│   ├── vite.config.ts        # Vite configuration
│   └── .env                  # Frontend environment variables
│
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.x or later) & `npm`
- **Python** (v3.10 or later) & `pip`
- **MongoDB Atlas** account (or local MongoDB instance)
- **Groq API Key** (obtainable from [Groq Console](https://console.groq.com/))

---

### Environment Configuration

#### 1. Backend Environment (`backend/.env`)

Create a `.env` file inside the `backend/` folder:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=groq/compound-mini

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

JWT_SECRET=your_jwt_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

#### 2. Frontend Environment (`frontend/.env`)

Create a `.env` file inside the `frontend/` folder:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

### Backend Installation

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate
     ```
   - **macOS/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server using Uvicorn:
   ```bash
   uvicorn app:app --reload --port 8000
   ```
   The API server will run at `http://localhost:8000`. API documentation (Swagger UI) will be accessible at `http://localhost:8000/docs`.

---

### Frontend Installation

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The web application will open at `http://localhost:5173`.

---

## 📡 API Reference

Here are the key API endpoints exposed by the FastAPI backend:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server and database connectivity check |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Login user & issue JWT token |
| `POST` | `/api/auth/google` | Authenticate with Google ID token |
| `POST` | `/api/projects/` | Create a new project |
| `GET` | `/api/projects/` | List user projects |
| `POST` | `/api/documents/classify` | Classify uploaded PDF document |
| `POST` | `/api/evaluation/evaluate` | Evaluate credit compliance via Groq LLM |
| `POST` | `/api/projects/{id}/chat` | Query project AI assistant |
| `GET` | `/api/analytics/dashboard` | Fetch analytics and compliance metrics |

---

## 💡 Troubleshooting & FAQs

- **MongoDB Disconnected Warning**: Verify that your IP address is whitelisted in MongoDB Atlas Network Access and that `MONGODB_URI` is correctly populated.
- **Model Downloading on First Start**: Upon initial launch, the system automatically checks and initializes the DistilBERT model. This step may take a few seconds on first run.
- **Groq API Rate Limits**: Ensure your `GROQ_API_KEY` is valid and active in `backend/.env`.

---

## 🤝 Contributing & Support

Contributions are welcome! For major feature updates or bug fixes, please open an issue or submit a pull request.
