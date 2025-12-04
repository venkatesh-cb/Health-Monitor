# 🧪 Health Report Monitor

A complete end-to-end system for **medical report upload, processing, extraction, standardization, and visualization**.  
The project combines a **React (Vite)** based UI with a **Supabase** backend and a powerful **n8n workflow engine** for automated PDF/image extraction, LOINC mapping, and database insertion.

* * *

## 🚀 **Overview**

Health Report Monitor allows users to upload lab reports (PDF, JPEG, PNG), which are then processed through an automated n8n workflow to extract structured medical data such as:

-   Patient details
    
-   Lab metadata
    
-   Test results (numeric & qualitative)
    
-   Reference ranges
    
-   LOINC standardized mappings
    

The frontend instantly navigates users to a **Processing Page**, while the backend workflow runs asynchronously. After extraction, users can view report details and fill optional additional information.

* * *

## 🌟 **Key Features**

### **Frontend**

-   Clean, responsive UI built using **React + Vite + TypeScript**
    
-   Report upload with instant navigation to “Processing”
    
-   Real-time progress steps (Validation → OCR → Extraction → Mapping → Writing)
    
-   Additional info form with validation (phone, email, emergency contact, etc.)
    
-   60-second controlled processing timer (even if backend finishes early)
    
-   Display of saved additional info in the Report Details page
    

### **Backend (n8n Workflows)**

-   PDF & image extraction using **Gemini 2.5 Pro / Flash**
    
-   Text length heuristic for digital vs scanned reports
    
-   Structured information extraction using JSON schema
    
-   LOINC lookup, similarity scoring, caching & standardized test naming
    
-   Automatic insertion of:
    
    -   Patients
        
    -   Reports
        
    -   Test Results
        
-   Intelligent test categorization (CBC, LFT, Lipid Profile, etc.)
    
-   Full retry logic & error handling
    

### **Database (Supabase / PostgreSQL)**

-   Three core tables:
    
    -   `patients`
        
    -   `reports`
        
    -   `test_results`
        
-   Proper FK relations with `ON DELETE CASCADE`
    
-   Indexes for fast search (LOINC, flags, patient+test lookup)
    

* * *

## 🛠 **Tech Stack**

### **Frontend**

-   React 18
    
-   TypeScript
    
-   Vite
    
-   Tailwind / ShadCN UI
    
-   React Router
    
-   State utilities + custom hooks
    
-   Supabase JS Client
    
-   Icons: Lucide
    

### **Backend**

-   **n8n Automation Workflows**
    
-   Google Gemini (PaLM API)
    
-   PostgreSQL (Supabase-managed)
    

### **Languages Used**

-   **TypeScript** (Frontend)
    
-   **SQL** (Supabase tables & queries)
    
-   **JavaScript** (n8n Code Nodes)
    
-   **JSON Schema** (Information Extractor)
    

* * *

## 📁 **Project Structure**

### 📦 **Frontend Folder Structure**

`src/ │ ├── App.tsx ├── main.tsx │ ├── pages/ │   ├── Home.tsx │   ├── Index.tsx │   ├── Processing.tsx │   ├── ReportDetails.tsx │ ├── components/ │   ├── NavLink.tsx │   ├── ui/ (shadcn ui components) │ ├── lib/ │   ├── client.ts        # Supabase client │   ├── types.ts         # Shared type definitions │ └── assets/`

### 🔧 **n8n Workflow Structure**

#### **Frontend Workflow (Report Submission)**

`Webhook → Switch (file type) →      ExtractFromFile → FindPDFLength → IsDigital?         → Analyze Document (PDF)         → Analyze Image (IMG)  → Information Extractor → Set Data Structure → Send To Backend Webhook`

#### **Backend Workflow (DB Write Pipeline)**

`Webhook → Insert Patient → Insert Report → Split Tests → Loop Over Tests → Check LOINC Cache → If Cached?      → Lookup LOINC → Build SQL Params → Insert Mapping Cache → Attach LOINC to Test → Prepare Test Data → Insert Test Results`

* * *

## ⚙️ **Setup & Installation**

### 1\. Clone Repository

`git clone https://github.com/<your-username>/<repo>.git cd health-report-monitor`

### 2\. Install Dependencies

`npm install`

### 3\. Configure Supabase

Create `.env`:

`VITE_SUPABASE_URL="your-url" VITE_SUPABASE_ANON_KEY="your-key"`

### 4\. Run the Dev Server

`npm run dev`

### 5\. Configure n8n Workflows

Import both:

-   `frontend-workflow.json`
    
-   `backend-db-write.json`
    

Update:

-   Webhook URLs
    
-   Supabase credentials
    
-   Gemini API key
    

* * *

## 🧪 **How the Flow Works**

1.  User uploads a PDF/image
    
2.  App **immediately routes** to `/processing` and shows progress steps
    
3.  n8n workflow processes document in background
    
4.  Extracted structured JSON is written to:
    
    -   `patients`
        
    -   `reports`
        
    -   `test_results`
        
5.  After 1 minute, user can continue to the Dashboard
    
6.  Additional info (phone, email, etc.) is optional but validated
    

* * *

## 🤝 Contributing

Pull requests are welcome!  
Make sure to follow:

-   Clean code practices
    
-   Typescript strictness
    
-   Atomic commits
    

* * *

## 📄 License

This project is proprietary and private unless you choose a license.  
(You can add MIT / Apache / GPL based on your preference.)