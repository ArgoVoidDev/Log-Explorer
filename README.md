content = """# 🚀 AI-Powered Semantic Log Explorer

## 📖 About the project
This project is a powerful tool (Micro-SaaS) for developers that receives server log files and analyzes the cause of complex errors and bugs using artificial intelligence. The application is designed as a completely front-end-focused MVP and uses BYOK (Bring Your Own Key) architecture to avoid the need for an external server or database for core processing.

## ✨ Key features
* **BYOK (Bring Your Own Key) architecture:** Users enter their API key (like Gemini) securely in their browser, and this key is never sent to a server.
* **Drag & Drop Uploader:** A modern user interface for dragging and dropping log files (`.txt` and `.log`) up to 5 MB in size. Files are read directly into the browser cache.
* **Local database (In-Browser Vector DB):** Long text files are divided into smaller chunks in the browser and prepared for fast vector search within the same web browser.
* **Analyst Chatbot:** Ability to talk to system logs to quickly find the root of errors.
* **No backend required (Zero Backend):** Complete privacy; all processing is done on the client side.

## 🛠 Technologies used
* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS
* Lucide React

## 🚀 Project setup (installation)
1. First, clone the repository.
2. Install dependencies:
3. npm run dev
4. open http://localhost:3000/dashboard