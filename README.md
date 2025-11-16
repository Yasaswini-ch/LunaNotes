<div align="center">
  <h1 align="center">
    🌙 LunaNotes
  </h1>
  <p align="center">
    <strong>Turn Messy Notes into Magic.</strong>
  </p>
  <p align="center">
    An AI-powered learning assistant that transforms raw notes into structured, digestible formats, complete with summaries, key points, definitions, mindmaps, and an interactive chat.
  </p>
  <p align="center">
    Built with the modern web in mind, LunaNotes is a showcase of performance, aesthetics, and cutting-edge AI integration.
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Google_Gemini-8E75B7?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Google Gemini" />
  </p>
</div>

<br />

<p align="center">
  <img src="https://storage.googleapis.com/aistudio-app-serve-assets/gallery-assets/luna-notes-hero.png" alt="LunaNotes Application Screenshot" width="800"/>
</p>

---

## ✨ Key Features

LunaNotes is meticulously engineered to supercharge your learning and productivity workflow.

- **🤖 AI-Powered Note Processing:** At its core, LunaNotes uses Google Gemini to intelligently parse and structure any text.
  - **Correction & Cleaning:** Automatically fixes typos and formatting inconsistencies in the source text.
  - **Summarization:** Distills lengthy documents into a concise, easy-to-digest paragraph.
  - **Key Point Extraction:** Identifies and lists the most critical takeaways as bullet points.
  - **Glossary Creation:** Detects important terms and formulas, generating a built-in glossary with definitions.

- **✍️ Versatile Input Methods:**
  - **Text Paste:** Simply copy and paste any text directly into the application.
  - **File Upload:** Drag and drop or browse for `.pdf`, `.docx`, `.txt`, and `.md` files for seamless processing.
  - **Voice-to-Text:** Utilize the browser's built-in speech recognition to dictate notes, lectures, or thoughts in real-time.

- **💡 Interactive & Insightful Outputs:**
  - **Structured Results Page:** View all processed content—summary, key points, definitions—in a clean, organized, and aesthetically pleasing layout.
  - **Dynamic Mindmaps:** Generate and interact with mindmaps that visually represent the connections between concepts, powered by Mermaid.js.
  - **Context-Aware AI Chat:** Engage in a conversation with your notes. Ask follow-up questions, request clarifications, or test your knowledge with an AI that understands the context of your material.

- **🚀 Productivity & Workflow Tools:**
  - **Productivity Timer:** A built-in Pomodoro-style timer to help you maintain focus during study sessions.
  - **Draft Management:** Automatically detects and allows you to load previously processed notes, ensuring you never lose your work.
  - **Export & Share:** Download your structured notes as a JSON file for archival or copy individual sections to the clipboard with a single click.

- **🎨 Superior User Experience:**
  - **Elegant UI/UX:** A beautiful, intuitive, and fully responsive interface with a stunning pastel-and-deep-magenta color palette.
  - **Light & Dark Themes:** Automatically detects system preference and allows seamless switching between themes.
  - **Guided Onboarding:** A brief, helpful tour for new users to quickly master the application's features.
  - **Subtle Animations & Transitions:** Smooth, meaningful animations provide visual feedback and enhance the user experience.

---

## 🛠️ Tech Stack & Architecture

LunaNotes is built on a modern, performant, and scalable tech stack, embracing the latest Angular features and best practices.

- **Frontend Framework:** [**Angular**](https://angular.io/) (v20+)
  - **Standalone Components:** The entire application is built using a modular, NgModule-less architecture for better organization and tree-shakability.
  - **Signals for State Management:** All component and service-level state is managed reactively and efficiently with Angular Signals.
  - **Zoneless Change Detection:** Opting into zoneless mode provides a significant performance boost by giving us fine-grained control over when the UI updates.
- **AI Engine:** [**Google Gemini API**](https://ai.google.dev/) (`gemini-2.5-flash`) is used for all generative AI tasks, including note structuring, mindmap syntax generation, and conversational chat.
- **Language:** [**TypeScript**](https://www.typescriptlang.org/) with strict type checking enabled for robust and maintainable code.
- **Styling:** [**Tailwind CSS**](https://tailwindcss.com/) provides a utility-first approach for rapid, responsive, and consistent UI development.
- **Client-Side Libraries:**
  - **Mermaid.js:** For rendering complex mindmap diagrams from AI-generated syntax.
  - **pdf.js & Mammoth.js:** To parse and extract text from `.pdf` and `.docx` files directly in the browser.
- **Platform APIs:**
  - **Web Speech API:** For real-time, in-browser voice-to-text transcription.
  - **Local Storage API:** Used for persisting user theme preferences and saving note drafts.

---

## 💻 Development Tooling

A professional workflow is supported by a set of powerful development tools.

- **Code Editor:** [**Visual Studio Code**](https://code.visualstudio.com/) is recommended, along with these extensions:
  - **Angular Language Service:** Provides a rich editing experience for Angular templates.
  - **Prettier - Code Formatter:** To ensure consistent code style across the project.
- **Version Control:** [**Git**](https://git-scm.com/) and [**GitHub**](https://github.com) for source code management and collaboration.
- **AI Prototyping:** [**Google AI Studio**](https://aistudio.google.com/) for rapidly prototyping and refining the prompts used in the Gemini API calls.
- **Package Manager:** [**npm**](https://www.npmjs.com/) for managing project dependencies.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- A Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/lunanotes.git
    cd lunanotes
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up your Environment Variables:**
    - This project requires a Google Gemini API key.
    - In a production or CI/CD environment, you would set the `API_KEY` environment variable.
    - For local development, you can create a mechanism to load it if it's not provided by the development environment.

4.  **Run the development server:**
    This project is configured to be run in an environment that provides the necessary build tools and server. The application will be available at the port configured by the environment.

---

### Project Structure

The project follows a standard Angular structure, organized for clarity and scalability.

```
src/
├── app/
│   ├── components/       # All Angular components
│   │   ├── home/         # Main landing page
│   │   ├── results/      # Note display page
│   │   ├── mindmap/      # Mindmap visualization
│   │   ├── chat/         # Chat interface
│   │   └── ...           # Shared/UI components
│   ├── services/         # Core application logic
│   │   ├── ai.service.ts         # Handles all Gemini API calls
│   │   ├── notes-store.service.ts # State management for notes
│   │   ├── theme.service.ts      # Theme logic
│   │   └── ...
│   ├── models/           # TypeScript interfaces and type definitions
│   ├── app.component.ts  # Root application component
│   └── app.routes.ts     # Application routes
├── assets/               # Static assets like images and icons
└── ...
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
