# Quiz Tajm

A responsive, browser-based quiz application built with Vanilla JavaScript, HTML, CSS and Vite.

Quiz Tajm was originally developed as a collaborative school project at Chas Academy. This version is my individual continuation of the project, focusing on user experience, application reliability, code quality and modern frontend development.

## Features

- Three selectable quiz themes
- Dynamic questions from the Open Trivia Database API
- Randomized answer options
- Four-minute countdown timer
- Quiz progress indicator
- Dynamic results and answer review
- Persistent history of the five most recent games
- Handling of unanswered questions
- Loading states, error handling and retry functionality
- Responsive interface
- Accessibility considerations

## Tech Stack

| Technology         | Purpose                                       |
| ------------------ | --------------------------------------------- |
| HTML5              | Semantic page structure                       |
| CSS3               | Styling and responsive layouts                |
| Vanilla JavaScript | Application logic and DOM manipulation        |
| Vite               | Development server and production builds      |
| npm                | Dependency management                         |
| ESLint             | Static code analysis                          |
| Prettier           | Consistent code formatting                    |
| date-fns           | Localized date formatting                     |
| Open Trivia DB     | External quiz question API                    |
| Web Storage API    | Caching, application state and result history |

## Individual Improvements

### Modern Development Workflow

Migrated the original project to Vite and introduced npm, ESLint and Prettier to establish a more consistent and maintainable development workflow.

### API Integration and Caching

Implemented a local question bank to reduce unnecessary API requests.

The application requests 30 questions at a time and uses 10 questions per game. Remaining questions are stored locally and reused in future games within the same category.

### Rate Limiting

Implemented preventive request throttling to respect the limitations of the external API.

The application waits at least 5.5 seconds between requests initiated through the stored request timestamp and automatically retries once when a rate limit response is received.

### Error Handling and User Feedback

Improved the user experience during asynchronous operations through:

- Loading states while questions are being fetched
- Clear error messages
- A retry button when questions cannot be loaded
- Hidden quiz controls until questions are available

These improvements help prevent confusing or incomplete interface states.

### Dynamic Results

Replaced static result placeholders with actual application data, including:

- Score
- Total number of questions
- Completion time
- Completion date
- Correct and incorrect answers
- Unanswered questions

Players can expand individual result cards to review their selected answer and the correct answer.

### Persistent Result History

Implemented a result history using localStorage.

The five most recent games are displayed in reverse chronological order. Results are saved when a game ends rather than when the result page loads, preventing duplicate entries when the page is refreshed.

### User Experience and Accessibility

With my background in UX design, I focused on making the application understandable, predictable and easy to interact with.

Key considerations include:

- Visual feedback for selected answers
- Clear loading and error states
- Responsive layouts
- Accessible button states using ARIA attributes
- Semantic HTML elements
- Expandable answer reviews
- Text and icons alongside color-coded feedback
- Clear communication when the timer expires

## Data Storage

The application uses browser-based storage without requiring a backend or user account.

| Storage        | Purpose                                                                      |
| -------------- | ---------------------------------------------------------------------------- |
| sessionStorage | Selected theme and current quiz result                                       |
| localStorage   | Question cache, API request timestamps, submitted answers and result history |

## Project Structure

```text
quiztajm-vite/
├── css/
├── img/
├── js/
│   ├── questions.js
│   ├── startscreen.js
│   └── timer.js
├── pages/
│   ├── index.html
│   ├── questions.html
│   └── result.html
├── index.html
├── eslint.config.js
├── vite.config.js
├── package.json
├── package-lock.json
└── README.md
```

## Getting Started

Make sure Node.js and npm are installed.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## Available Commands

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| npm run dev          | Start the development server         |
| npm run build        | Generate a production build          |
| npm run preview      | Preview the production build locally |
| npm run lint         | Run ESLint                           |
| npm run format       | Format files with Prettier           |
| npm run format:check | Check code formatting                |
| npm run check        | Run linting and formatting checks    |

## Testing and Quality Assurance

The following functionality has been manually tested during development:

- API requests and question loading
- Question caching
- Simulated API rate limit recovery
- Error handling and retry functionality
- Quiz completion
- Timer expiration
- Score calculation
- Dynamic answer review
- Result history persistence
- Prevention of duplicate history entries on page refresh

ESLint, Prettier and the Vite production build have also been successfully executed.

## Known Limitations

- Questions are provided in English by the external API.
- Result history is stored locally in the browser.
- Internet access is required when the question cache needs to be replenished.
- API throttling is client-side and does not coordinate requests across different devices.
- Automated unit and integration tests are not currently implemented.

## Learning Objectives

This project demonstrates my practical understanding of:

- Asynchronous JavaScript
- Promises and async/await
- REST API integration
- Error handling with try/catch
- DOM manipulation
- Array methods
- Application state
- Browser storage
- ES modules
- Dependency management
- Frontend development tooling
- UX-driven software development

## Credits

Originally developed as a collaborative JavaScript project at Chas Academy, Fullstack JavaScript, FJS26, 2026.

This repository represents my individual continuation and technical improvements of the original group project.

Original project:

https://github.com/nathalie-bjorkman/u03.2---Projektarbet--quiz-app-grupp-7

Quiz questions are provided by:

https://opentdb.com/

## About the Developer

**Marcus Wiman**

UX Designer and Fullstack JavaScript student with an interest in combining user-centered design, frontend development and reliable digital experiences.

Portfolio: https://www.marcus-wiman.com/
