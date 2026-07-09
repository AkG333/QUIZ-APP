                      QUIZOVIAN PLATFORM DOCUMENTATION

Quizovian is a premium, smooth, and ambient-styled Online Quiz Application.
This documentation provides a comprehensive description of the system architecture,
the technologies used, backend REST APIs, frontend HTTP communication,
and step-by-step walkthrough instructions to run and test the application locally.

------------------------------------------------------------------------
1. TECHNOLOGY STACK
------------------------------------------------------------------------

A. Backend Server (Spring Boot)
================================
- Core Framework: Java JDK 21, Spring Boot (v4.1.x)
- Security: Spring Security 6 with JWT (JSON Web Tokens) Authentication
- Database ORM: Spring Data JPA (Hibernate 7.x)
- Database: MySQL Community Server (Database: `quiz_app_db`)
- Build Automation: Maven Wrapper (mvnw)
- Data Utilities: Lombok for boilerplate reductions

B. Frontend Application (React)
================================
- Build Tool: Vite
- Rendering Core: React 19 / React DOM
- Icons: Lucide React (e.g., Play, Timer, Shuffle, RefreshCw)
- Animations: Canvas Confetti (celebration explosions)
- Theme System: Vanilla CSS variables (ambient modes pink-ambient and blue-ambient)

------------------------------------------------------------------------
2. SYSTEM ARCHITECTURE & DATA FLOW
------------------------------------------------------------------------

The system is built on a split-stack client-server architecture:

  +-----------------------+              +-----------------------+
  |    React Frontend     |              |  Spring Boot Backend  |
  | (Vite Dev - Port 5173)| <==========> | (Tomcat Server - 8080)|
  |                       |   REST API   |                       |
  |  - State Management   |    (JSON)    |  - Spring Security    |
  |  - Glassmorphic UI    |              |  - JPA / Hibernate    |
  |  - Ambient Themes     |              |  - MySQL Database     |
  +-----------------------+              +-----------------------+

During development, Vite's dev server acts as a reverse proxy, directing requests 
matching `/api/*` to the Spring Boot server (port 8080) to bypass browser cross-origin 
constraints. The backend supports CORS explicitly to accept traffic from http://localhost:5173.

------------------------------------------------------------------------
3. BACKEND REST API ENDPOINTS
------------------------------------------------------------------------

All endpoints require JSON payloads (unless noted otherwise) and return JSON responses.
Authenticated endpoints require the HTTP header:
"Authorization: Bearer <JWT_TOKEN>"

A. Authentication Controller (/api/auth)
========================================
- POST /api/auth/register
  * Purpose: Creates a new user or administrator account.
  * Body: { "username": "...", "email": "...", "password": "...", "role": "USER" | "ADMIN" }
  * Returns: String message ("User Registered Successfully").
  
- POST /api/auth/login
  * Purpose: Authenticates a credentials payload and generates an access token.
  * Body: { "email": "...", "password": "..." }
  * Returns: Plain-text string containing the signed JWT token.

B. Quiz Controller (/api/quizzes)
=================================
- GET /api/quizzes
  * Purpose: Retrieve a list of quizzes. Admins will ONLY see quizzes they created, while players see all quizzes.
  * Access: USER, ADMIN.
  * Returns: Array of QuizResponse objects (id, title, quizCode, passwordProtected, totalQuestions, difficulty, timeLimit, randomizeQuestions).

- POST /api/quizzes
  * Purpose: Create a new quiz session (Admin only).
  * Access: ADMIN.
  * Body: { "title": "...", "passwordProtected": true|false, "quizPassword": "...", "difficulty": "EASY"|"MEDIUM"|"HARD", "timeLimit": 180, "randomizeQuestions": true|false }
  * Returns: Created QuizResponse.

- GET /api/quizzes/code/{quizCode}
  * Purpose: Find a quiz by its session code.
  * Access: USER, ADMIN.

- PUT /api/quizzes/{id}
  * Purpose: Modify quiz details. Admins can only modify their own quizzes.
  * Access: ADMIN.
  * Body: { "title": "...", "passwordProtected": true|false, "quizPassword": "...", "difficulty": "EASY"|"MEDIUM"|"HARD", "timeLimit": 180, "randomizeQuestions": true|false }

- DELETE /api/quizzes/{id}
  * Purpose: Remove a quiz. Admins can only delete their own quizzes.
  * Access: ADMIN.

C. Question Controller (/api/admin/quizzes)
===========================================
- GET /api/admin/quizzes/{quizId}/questions
  * Purpose: Retrieve all questions in a quiz (includes correct answers).
  * Access: ADMIN.

- POST /api/admin/quizzes/{quizId}/questions
  * Purpose: Add a question to a quiz.
  * Access: ADMIN.
  * Body: { "questionText": "...", "optionA": "...", "optionB": "...", "optionC": "...", "optionD": "...", "correctAnswer": "A"|"B"|"C"|"D" }

- PUT /api/admin/quizzes/questions/{questionId}
  * Purpose: Edit question details.
  * Access: ADMIN.

- DELETE /api/admin/quizzes/questions/{questionId}
  * Purpose: Remove a question from a quiz.
  * Access: ADMIN.

D. Quiz Attempt Controller (/api/attempts)
==========================================
- POST /api/attempts/join
  * Purpose: Join a quiz session to start taking it.
  * Access: USER, ADMIN.
  * Body: { "quizCode": "...", "password": "..." }
  * Returns: JoinQuizResponseDTO (attemptId, quizTitle, totalQuestions, firstQuestion, timeLimit).

- POST /api/attempts/{attemptId}/submit
  * Purpose: Submit an answer to the current question. If the time limit has expired, it automatically completes the attempt and returns an error.
  * Access: USER, ADMIN.
  * Body: { "questionId": 123, "selectedAnswer": "A"|"B"|"C"|"D" }
  * Returns: SubmitAnswerResponse (correct, correctAnswer, score, isLastQuestion, completed, percentage).

- GET /api/attempts/{attemptId}/next
  * Purpose: Fetch the next question in the active session.
  * Access: USER, ADMIN.

- POST /api/attempts/{attemptId}/finish
  * Purpose: Finalize and complete the quiz attempt early or when the timer expires.
  * Access: USER, ADMIN.
  * Returns: SubmitAnswerResponse indicating final score and percentage.

- GET /api/attempts/history
  * Purpose: Get the logged-in user's previous attempt history.
  * Access: USER, ADMIN.

E. Leaderboard Controller (/api/leaderboard)
=============================================
- GET /api/leaderboard/overall
  * Purpose: Returns overall player average score percentages across all taken quizzes.
- GET /api/leaderboard/quiz/{quizId}
  * Purpose: Retrieve user rankings for a specific quiz.

------------------------------------------------------------------------
4. FRONTEND HTTP CLIENT INTEGRATION (FETCH VS AXIOS)
------------------------------------------------------------------------

The frontend utilizes the native `fetch` API for all server communication. Below is the
documentation of how these request parameters are implemented, alongside an alternative
integration blueprint using `axios`.

A. Fetch API Implementation (As Written)
=========================================
1. Authentication Header:
   Requests must append the `Authorization` header with the Bearer JWT token.
   Example:
   ```javascript
   const res = await fetch('/api/quizzes', {
     headers: { 'Authorization': `Bearer ${token}` }
   });
   ```

2. Request Body and Method:
   Payload requests are serialized to JSON string format and must declare `Content-Type: application/json`.
   Example:
   ```javascript
   const res = await fetch(`/api/admin/quizzes/${quizId}/questions`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify({
       questionText: qText,
       optionA: qOptA,
       optionB: qOptB,
       optionC: qOptC,
       optionD: qOptD,
       correctAnswer: qCorrect
     })
   });
   ```

B. Equivalent Axios Implementation (Blueprint)
===============================================
If migrating the HTTP client layers to Axios, the configuration can be centralized
using Axios Interceptors to automatically inject headers.

1. Axios Client Instance Setup (`src/services/api.js`):
   ```javascript
   import axios from 'axios';

   const api = axios.create({
     baseURL: '/api',
     headers: {
       'Content-Type': 'application/json'
     }
   });

   // Interceptor to inject bearer token dynamically
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('quizovian_token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   }, (error) => {
     return Promise.reject(error);
   });

   export default api;
   ```

2. Using the Axios Instance:
   - Creating a Quiz:
     ```javascript
     import api from './api';

     const createQuiz = async (quizData) => {
       const response = await api.post('/quizzes', quizData);
       return response.data;
     };
     ```
   - Fetching Next Question:
     ```javascript
     const getNextQuestion = async (attemptId) => {
       const response = await api.get(`/attempts/${attemptId}/next`);
       return response.data;
     };
     ```

------------------------------------------------------------------------
5. LOCAL SETUP & LAUNCH INSTRUCTIONS
------------------------------------------------------------------------

Prerequisites:
- Java JDK 21 or higher installed.
- Node.js 18 or higher installed.
- MySQL database active and configured.

A. Database Configuration
=========================
1. Open your MySQL client and create a new schema named `quiz_app_db`:
   `CREATE DATABASE quiz_app_db;`
2. Update database credentials in `Backend/src/main/resources/application.properties`:
   - `spring.datasource.url=jdbc:mysql://localhost:3306/quiz_app_db`
   - `spring.datasource.username=YOUR_MYSQL_USERNAME` (defaults to root)
   - `spring.datasource.password=YOUR_MYSQL_PASSWORD`

B. Backend Launch
=================
1. Open a terminal in the `Backend` directory.
2. Launch the Spring Boot application:
   - Windows (PowerShell): `.\mvnw.cmd spring-boot:run`
   - macOS/Linux: `./mvnw spring-boot:run`
3. The server will launch and listen on `http://localhost:8080`. Hibernate will 
   automatically migrate tables (quizzes, questions, quiz_attempts, attempt_answers, users).

C. Frontend Launch
==================
1. Open a terminal in the `FrontEnd` directory.
2. Install npm dependencies:
   `npm install`
3. Launch the Vite development server:
   `npm run dev`
4. Open the listed URL (usually `http://localhost:5173/`) in your web browser.

------------------------------------------------------------------------
6. STEP-BY-STEP APPLICATION WALKTHROUGH
------------------------------------------------------------------------

Follow these steps to fully test all application configurations:

Step 1: Admin Setup & Quiz Creation
-----------------------------------
1. Navigate to `http://localhost:5173/` and click the "Create one" link below the login box.
2. Fill out the registration form: Enter a username, email, and password. Select **Administrator** in the Account Type dropdown. Click **Register**.
3. Log in with the newly registered administrator credentials.
4. On the Admin Dashboard, click **Create Quiz**.
5. Fill in details:
   - Title: "SpringBoot Core Challenge"
   - Difficulty Level: **Medium**
   - Time Limit: Set to **0 Hours, 2 Minutes, 30 Seconds** (equivalent to 150 seconds).
   - Randomize Question Order: Check the box to enable.
   - Click **Create Session**.
6. The new quiz will appear in the grid. Click on the quiz card to open its question manager.
7. Click **Add Question** to add questions:
   - Question 1: "What is Dependency Injection?" (Options: A, B, C, D; select correct answer). Save.
   - Question 2: "Which annotation registers a class as a Spring Bean?" (Options: A, B, C, D; select correct answer). Save.
   - Question 3: "What is the default bean scope in Spring?" (Options: A, B, C, D; select correct answer). Save.
8. Verify that the correct answers are clearly highlighted for you in the question list.
9. Click the Logout icon in the navigation bar.

Step 2: Take Quiz as a Player
-----------------------------
1. Click "Create one" again to register a new player.
2. Register with role **Player**.
3. Log in with the player credentials.
4. On the User Dashboard, look at the "Available Quizzes" section.
5. Verify that the "SpringBoot Core Challenge" card shows:
   - A blue **MEDIUM** difficulty badge.
   - A timer badge: **2m 30s**.
   - A purple **Randomized** (shuffled order) badge.
6. Click **Start Quiz** to begin.
7. On the Quiz Play interface, verify:
   - The countdown timer is ticking down starting from `2:30`.
   - The question displayed first is randomized (e.g. Question 2 or 3 instead of 1).
8. Answer the first two questions, clicking **Submit Answer** and **Next Question**.
9. Let the timer run down to `0:00`.
10. Verify that when the timer expires:
    - The screen shows "Time's up! Finalizing your quiz attempt...".
    - The quiz is automatically submitted.
    - You are redirected to the celebration/results screen displaying your final radial score percentage based on the questions you completed.
11. Click **Back to Dashboard** to view your recent attempt logged in the history table.
========================================================================
