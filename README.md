<<<<<<< HEAD
# Quiz Filler

#### Video Demo:  https://youtu.be/dQvtrKhTgzg

#### Description:

Quiz Filler is a Chrome extension that analyzes Google Forms and automatically generates accurate answers using Google's Gemini AI models. The extension is designed to reduce the effort required to answer large or repetitive quizzes by scanning the structure of a form, understanding different question types, and presenting AI-generated answers directly within the form interface.

The project focuses on building a complete, real-world browser extension using modern Chrome Extension APIs (Manifest V3), asynchronous JavaScript, DOM manipulation, background service workers, and external REST API integration. It demonstrates how frontend scripts, background logic, and user interface components can work together in a clean and maintainable architecture.

The extension works exclusively on Google Forms. If the popup is opened on any other website, the user is shown an error message instructing them to open a Google Form before continuing. This ensures the extension operates only in its intended environment and avoids unnecessary permissions or unintended behavior.

---

## Project Structure

quiz_filler  
├── manifest.json  
├── background.js  
├── content.js  
├── README.md  
├── popup/   
│   ├── popup.html  
│   ├── popup.css  
│   ├── popup.js  
│   └── bootstrap.min.css  
└── images/  
    ├── icon-16.png  
    ├── icon-32.png  
    ├── icon-48.png  
    └── icon-128.png  

---

### First-Time Usage and API Key Handling

When the extension is opened for the first time, the user is prompted to enter a Gemini API key. This key is required for generating answers using Google's Gemini models. Upon submission, the key is immediately validated by sending a test request to the Gemini REST API. If the key is invalid or the request fails, an error message is displayed and the user is prevented from proceeding further.

Only after successful validation does the extension allow access to the main dashboard. The API key is securely stored using `chrome.storage.local` and is never hard-coded into the source code. The user can change the API key at any time through the popup interface, which resets the validation flow.

---

### Scanning and Answer Generation Workflow

Once the user clicks the "Find Answers" button, the scanning process begins. The popup script (`popup.js`) sends a message to the content script instructing it to start reading the Google Form. The entire process is asynchronous, meaning the user interface remains responsive throughout the operation. Even if the popup is closed, the background scanning continues until completion.

The content script (`content.js`) scans the page DOM and extracts all question-related text by reading `<span>` elements inside Google Form question containers. These spans are grouped and analyzed to reconstruct each question and its available options. The script then classifies each question into one of three categories: short answer, multiple choice, or checkbox. Every question is assigned a unique ID to ensure accurate mapping between questions and answers.

After classification, the extracted question data is sent to the background service worker (`background.js`), which handles all AI-related logic.

---

### Background Processing and AI Integration

The background script acts as the core logic controller of the extension. It receives the classified questions and constructs carefully structured prompts for the Gemini AI models. The extension allows the user to choose between Gemini 2.5 Flash and Gemini 2.5 Flash-Lite, depending on performance and accuracy needs.

Prompts are intentionally strict and minimal. They enforce a fixed output format, prevent unnecessary explanations, and ensure that each answer is tied to its corresponding question ID. Responses from the Gemini REST API are parsed using regular expressions to validate correctness before being sent back to the content script.

This separation of responsibilities ensures that all heavy computation and API communication occur off the main UI thread, resulting in a smooth user experience.

---

### Injecting and Displaying Answers

Once answers are received, the content script injects them directly into the Google Form interface. For multiple-choice and checkbox questions, the correct options are highlighted in green by modifying their styles. For short-answer questions, the extension does not simulate user input. Instead, it creates a new `<div>` element adjacent to the input field and inserts the generated answer as readable text.

This approach avoids interfering with form behavior while still clearly presenting the answers to the user. After all questions are processed, the extension updates its internal state and notifies the popup script that scanning is complete.

---

### File Overview

- `manifest.json`  
  Defines the extension configuration, permissions, content scripts, background service worker, popup UI, keyboard shortcuts, and icons. The extension requests only the `tabs` and `storage` permissions, where `tabs` is used to access the active Google Form and `storage` is used to securely store the API key and runtime state.

- `background.js`  
  Handles API key validation, Gemini REST API communication, prompt construction, response parsing, and answer mapping. This file contains all AI-related logic and runs as a service worker.

- `content.js`  
  Executes on Google Forms pages. It reads and classifies questions, sends extracted data to the background script, and injects answers back into the page by modifying the DOM.

- `popup.html`  
  Defines the structure of the popup interface, including API key input, model selection, scan controls, error messages, and progress indicators.

- `popup.css`  
  Provides custom styling for the popup UI, including gradients, card layouts, buttons, spacing, and visual feedback elements.

- `bootstrap.min.css`  
  A locally bundled Bootstrap stylesheet used to ensure consistent styling without relying on external CDN loading.

- `popup.js`  
  Controls popup behavior, manages extension state, communicates with content and background scripts, and updates the UI based on scanning progress.

---

### Design Choices and Limitations

A key design decision was to highlight or display answers instead of automatically submitting forms. This avoids simulating user input and keeps the extension safe, transparent, and respectful of platform behavior. Another important choice was to strictly separate UI logic, DOM manipulation, and AI processing across different scripts, improving maintainability and scalability.

The extension has been tested on forms containing up to 100 questions with strong accuracy. While it may support larger forms, those cases have not been fully tested. Accuracy ultimately depends on question clarity and structure.

---

### Conclusion

Quiz Filler is a fully functional Chrome extension that demonstrates practical browser extension development and real-world AI integration. It combines asynchronous execution, structured prompt engineering, DOM analysis, and a polished user interface into a cohesive and reliable tool. The project reflects careful design decisions, attention to security, and a strong understanding of modern web extension architecture.
=======
# demorepo
hehe
asdfghjkl
>>>>>>> 3f870a8403dbffdf7137342c645d8865ffd1ae1a
