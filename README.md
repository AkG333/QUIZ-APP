                      QUIZOVIAN PLATFORM DOCUMENTATION

Quizovian is a premium, smooth, and ambient-styled Online Quiz Application.
This documentation provides a comprehensive description of the system architecture,
individual REST API endpoints, frontend component structures, the interactive
communication flow, and local environment setup instructions.

------------------------------------------------------------------------
1. SYSTEM ARCHITECTURE OVERVIEW
------------------------------------------------------------------------

The system is built on a split-stack client-server architecture:

  +-----------------------+              +-----------------------+
  |    React Frontend     |              |  Spring Boot Backend  |
  |  (Vite Dev - Port 5173)| <==========> |  (Tomcat Server - 8080)|
  |                       |   REST API   |                       |
  |  - State Management   |    (JSON)    |  - Spring Security    |
  |  - Glassmorphic UI    |              |  - JPA / Hibernate    |
  |  - Ambient Themes     |              |  - MySQL Database     |
  +-----------------------+              +-----------------------+

Communication is established via clean RESTful requests. During development,
Vite's dev server acts as a reverse proxy, directing requests matching /api/*
to the Spring Boot server to bypass browser cross-origin constraints. In addition,
the backend supports CORS explicitly to accept traffic from http://localhost:5173.

------------------------------------------------------------------------
2. BACKEND REST API ENDPOINTS
------------------------------------------------------------------------

All endpoints require JSON payloads (unless noted otherwise) and return JSON
responses. Authenticated endpoints require an HTTP header:
"Authorization: Bearer <JWT_TOKEN>"

A. Authentication Controller (/api/auth)
========================================
- POST /api/auth/register
  * Purpose: Creates a new user or administrator account.
  * Body: { "username": "...", "email": "...", "password": "...", "role": "USER" | "ADMIN" }
  * Returns: String message ("User Registered Successfully").
  
- POST /api/auth/login
  * Purpose: Authenticates a user and generates an access token.
  * Body: { "email": "...", "password": "..." }
  * Returns: Plain-text string containing the signed JWT token. The token contains
    custom claims for "username" and "role" (ROLE_USER or ROLE_ADMIN) alongside
    the email subject claim.

B. Quiz Controller (/api/quizzes)
=================================
- GET /api/quizzes
  * Purpose: Retrieve a list of all active quizzes.
  * Access: USER, ADMIN.
  * Returns: Array of QuizResponse objects containing title, quizCode, totalQuestions, and passwordProtected boolean.

- POST /api/quizzes
  * Purpose: Create a new quiz session (Admin only).
  * Access: ADMIN.
  * Body: { "title": "...", "passwordProtected": true|false, "quizPassword": "..." }
  * Returns: Created QuizResponse with generated code (e.g. QZ-A2B3C4).

- GET /api/quizzes/code/{quizCode}
  * Purpose: Find a quiz by its generated session code.
  * Access: USER, ADMIN.

- PUT /api/quizzes/{id}
  * Purpose: Modify quiz details (Admin only).
  * Access: ADMIN.

- DELETE /api/quizzes/{id}
  * Purpose: Remove a quiz and delete its associated questions/attempts (Admin only).
  * Access: ADMIN.

C. Question Controller (/api/admin/quizzes)
===========================================
- GET /api/admin/quizzes/{quizId}/questions
  * Purpose: Retrieve a list of all questions in a quiz (Admin only).
  * Access: ADMIN.

- POST /api/admin/quizzes/{quizId}/questions
  * Purpose: Add a multiple-choice question to a quiz (Admin only).
  * Access: ADMIN.
  * Body: { "questionText": "...", "optionA": "...", "optionB": "...", "optionC": "...", "optionD": "...", "correctAnswer": "A"|"B"|"C"|"D" }
  * Returns: Created QuestionResponse.

- PUT /api/admin/quizzes/questions/{questionId}
  * Purpose: Edit question details (Admin only).
  * Access: ADMIN.

- DELETE /api/admin/quizzes/questions/{questionId}
  * Purpose: Remove a question from a quiz (Admin only).
  * Access: ADMIN.

D. Quiz Attempt Controller (/api/attempts)
==========================================
- POST /api/attempts/join
  * Purpose: Join a quiz session to start taking it.
  * Access: USER, ADMIN.
  * Body: { "quizCode": "...", "password": "..." } (Password is optional/required based on protection status).
  * Returns: JoinQuizResponseDTO containing attemptId, quizTitle, totalQuestions, and firstQuestion details.

- POST /api/attempts/{attemptId}/submit
  * Purpose: Submit an answer to the current question.
  * Access: USER, ADMIN.
  * Body: { "questionId": 123, "selectedAnswer": "A"|"B"|"C"|"D" }
  * Returns: SubmitAnswerResponse detailing if the selected option is correct,
    what the correct answer code is, the updated score, and completion flags.

- GET /api/attempts/{attemptId}/next
  * Purpose: Fetch the next question in the active session.
  * Access: USER, ADMIN.
  * Returns: QuestionResponse for the next question.

- GET /api/attempts/history
  * Purpose: Get the logged-in user's previous attempt history.
  * Access: USER, ADMIN.
  * Returns: List of attempt records, with scores, percentages, and completed dates.

E. Leaderboard Controller (/api/leaderboard)
=============================================
- GET /api/leaderboard/overall
  * Purpose: Returns overall player average score percentages across all taken quizzes.
  * Returns: List of OverallLeaderboardEntry (username, averagePercentage, quizzesAttempted, totalScore).

- GET /api/leaderboard/quiz/{quizId}
  * Purpose: Retrieve rankings for a specific quiz.
  * Returns: List of LeaderboardEntry (username, score, totalQuestions, percentage, completedAt).

------------------------------------------------------------------------
3. FRONTEND ARCHITECTURE & COMPONENTS
------------------------------------------------------------------------

The client is a single page application built using React 19 and Vite.

Core Files
==========
- index.html: Sets viewport, imports modern Google Fonts ("Outfit" and "Plus Jakarta Sans"), and provides root container.
- vite.config.js: Injects `@vitejs/plugin-react` and configures the dev proxy mapping `/api` requests to `http://localhost:8080`.
- src/main.jsx: Bootstraps the React virtual DOM under StrictMode.
- src/index.css: House of the ambient design system. Implements custom styling tokens, moving background animations, glassmorphism templates, and glowing elements.
- src/App.jsx: Root component. Orchestrates global state:
  * token: persisted in localStorage to remain logged in.
  * user: decoded JWT claims (email, username, role).
  * theme: pink-ambient or blue-ambient, synced to localStorage and root html attribute.
  * view: dashboard, quiz-play, leaderboard.

Reusable UI Components (src/components/)
========================================
- ThemeSelector.jsx: Floating selector toggling between 'pink-ambient' and 'blue-ambient'.
- Login.jsx: Frosted card that switches between login and registration. Includes input fields for email, username, password, and account role type (Player/Admin).
- Navbar.jsx: Top transparent navigation bar with active state colors, user greeting badge, and log-out buttons.
- UserDashboard.jsx: Player dashboard displaying statistical summaries, a list of available quizzes, custom code joining forms, a history log, and top 5 leaderboards.
- AdminDashboard.jsx: Admin controller containing quizzes management table, a quiz creator dialog, and interactive question editor screens (CRUD).
- QuizPlay.jsx: Interactive test runner. Includes choice options, submit checkings, timers/progress indicators, radial percentages, and confetti celebrations.
- Leaderboard.jsx: Championship board rendering rankings filtered by specific quizzes or overall systems averages.

------------------------------------------------------------------------
4. HOW BACKEND & FRONTEND WORK IN HARMONY: LIFE OF A REQUEST
------------------------------------------------------------------------

To demonstrate how the frontend and backend interact, here is the chronological
journey of a user taking a password-protected quiz:

[Step 1: Auth & Handshake]
  1. The player launches the frontend. Since no token is present in localStorage,
     App.jsx redirects to the Login screen.
  2. The player types their credentials and clicks "Sign In".
  3. Login.jsx fires a POST request to /api/auth/login.
  4. The backend verifies the email and password, generates a JWT token, encodes
     "username" and "role" claims, and returns it as plain text.
  5. The frontend stores the token in localStorage and updates the state. App.jsx
     intercepts the change, decodes the claims using atob(), and sets the user object
     role (ROLE_USER). This automatically loads the Player Dashboard.

[Step 2: Dashboard Fetching]
  1. UserDashboard.jsx triggers fetch requests to /api/quizzes, /api/attempts/history,
     and /api/leaderboard/overall, passing the Bearer token in the request headers.
  2. The backend intercepts requests via JwtAuthenticationFilter, checks database validity,
     and responds with the corresponding list values.
  3. The Player Dashboard populates with quiz cards and statistics charts.

[Step 3: Joining Protected Quizzes]
  1. The player locates a quiz with a "Protected" badge and clicks "Start Quiz".
  2. The frontend opens a password input modal.
  3. The player inputs the session password and clicks "Unlock & Start".
  4. The frontend calls POST /api/attempts/join with the quiz code and password.
  5. The backend validates the code and password. If valid, it logs a new QuizAttempt record
     and responds with the attemptId and the first question.
  6. The frontend receives the question data and changes the view state to "quiz-play".

[Step 4: Interactive Quiz-Taking]
  1. QuizPlay.jsx displays the question text and options.
  2. The player clicks an option (which glows to represent the choice selection) and clicks "Submit Answer".
  3. The frontend calls POST /api/attempts/{attemptId}/submit with the questionId and option code.
  4. The backend checks if the answer matches the database record, updates the attempt score, and returns
     the verification details (correctness, the correct option, score, and last-question indicators).
  5. The option buttons render the correctness glow: the clicked option turns green if correct, or red if incorrect
     while the correct option highlights green.
  6. The player clicks "Next Question", which calls GET /api/attempts/{attemptId}/next to load the next question.

[Step 5: Completion and Celebration]
  1. On the last question, the submit response returns a `completed: true` flag.
  2. The player clicks "Finish Quiz", setting `quizCompleted: true` in QuizPlay.jsx.
  3. The frontend triggers `canvas-confetti` explosion animations and calculates the radial progress circle offset.
  4. The player clicks "Back to Dashboard", returning back to the home views. The dashboard reload fetches updated stats.

------------------------------------------------------------------------
5. DESIGN DETAILS & AMBIENT INTERFACES
------------------------------------------------------------------------

To achieve the modern "ambient" visual quality, the frontend utilizes customized CSS
configurations inside index.css:

A. Moving Background Glows:
   - Three absolute-positioned divs (`.ambient-orb`) drift across the screen via CSS keyframes.
   - An extreme blur filter (`filter: blur(130px)`) is applied to blend the elements.
   - A blend mode (`mix-blend-mode: screen`) produces glowing overlay combinations.

B. HSL Theme Customizations:
   - The theme selector changes the root tag attributes (`data-theme="pink-ambient"` or `"blue-ambient"`).
   - Color values, border tones, and shadows are bound to CSS variable tokens:
     * Pink Ambient: uses rich velvet-roses, violet, and neon-pink glows.
     * Blue Ambient: uses deep oceanic blues, cyans, and sapphire glows.
   - All colors, filters, and shadows transition smoothly via:
     `transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);`

C. Glassmorphic Pill Navbar and Cards:
   - Elements are styled with background translucency (`rgba(255, 255, 255, 0.03)`).
   - Glass reflections are generated via backdrop blurs (`backdrop-filter: blur(20px)`).
   - Interactive hover actions slightly translate the cards upwards and expand shadow parameters.

------------------------------------------------------------------------
6. LOCAL SETUP & LAUNCH INSTRUCTIONS
------------------------------------------------------------------------

Prerequisites:
- Java JDK 21+ installed.
- Node.js 18+ installed.
- MySQL database active and configured.

A. Backend Setup
================
1. Configure your database settings inside `Backend/src/main/resources/application.properties`
   (DB URL, username, password).
2. Open a terminal in the `Backend` directory.
3. Run the Spring Boot application:
   powershell: .\mvnw.cmd spring-boot:run
   bash: ./mvnw spring-boot:run
4. The server will launch and listen on `http://localhost:8080`.

B. Frontend Setup
=================
1. Open a terminal in the `FrontEnd` directory.
2. Install npm dependencies:
   npm install
3. Launch the Vite development server:
   npm run dev
4. Open `http://localhost:5173/` in a browser.

C. Build for Production (Optional)
==================================
To bundle the frontend for production, run:
   npm run build
The compiled assets will be written to the `FrontEnd/dist` directory.
========================================================================
