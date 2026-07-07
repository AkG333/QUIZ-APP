# Manual Testing Plan - Online Quiz Application APIs

This document provides a step-by-step guide to manually testing the complete REST API lifecycle of the Online Quiz Application using `curl` commands.

---

## 1. Prerequisites
Start the Spring Boot application by running the following command in the `Backend` directory:
```powershell
.\mvnw.cmd spring-boot:run
```
The server will start on `http://localhost:8080`.

---

## 2. API Testing Workflow

We will run a complete walkthrough of registering an admin, creating a quiz with questions, registering a user, taking the quiz, and reviewing progress/leaderboards.

### Step 1: Register and Login as Admin

#### A. Register Admin Account
* **Endpoint**: `POST http://localhost:8080/api/auth/register`
* **cURL Command**:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_tester",
    "email": "admin@quiz.com",
    "password": "SecurePassword123",
    "role": "ADMIN"
  }'
```
* **Expected Response**: `User Registered Successfully`

#### B. Log in to get Admin JWT Token
* **Endpoint**: `POST http://localhost:8080/api/auth/login`
* **cURL Command**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@quiz.com",
    "password": "SecurePassword123"
  }'
```
* **Expected Response**: A plain-text JWT token. 
> [!IMPORTANT]
> Copy the returned token. In all subsequent admin API requests, replace `<ADMIN_TOKEN>` with this value.

---

### Step 2: Register and Login as User

#### A. Register User Account
* **Endpoint**: `POST http://localhost:8080/api/auth/register`
* **cURL Command**:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user_tester",
    "email": "user@quiz.com",
    "password": "UserPassword123",
    "role": "USER"
  }'
```
* **Expected Response**: `User Registered Successfully`

#### B. Log in to get User JWT Token
* **Endpoint**: `POST http://localhost:8080/api/auth/login`
* **cURL Command**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@quiz.com",
    "password": "UserPassword123"
  }'
```
* **Expected Response**: A plain-text JWT token.
> [!IMPORTANT]
> Copy the returned token. In all subsequent user/player API requests, replace `<USER_TOKEN>` with this value.

---

### Step 3: Admin Quiz & Question Setup

Now we act as the admin to create a quiz and populate questions.

#### A. Create a Quiz (Admin only)
* **Endpoint**: `POST http://localhost:8080/api/quizzes`
* **cURL Command**:
```bash
curl -X POST http://localhost:8080/api/quizzes \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "General Trivia",
    "passwordProtected": false
  }'
```
* **Expected Response**:
```json
{
  "id": 1,
  "title": "General Trivia",
  "quizCode": "QZ-XXXXXX",
  "passwordProtected": false,
  "totalQuestions": 0
}
```
> [!NOTE]
> Save the `quizCode` (e.g. `QZ-A1B2C3`) and `id` (e.g. `1`) from the response.

#### B. Add Question 1 to the Quiz (Admin only)
* **Endpoint**: `POST http://localhost:8080/api/admin/quizzes/1/questions` (Replace `1` with the created quiz ID)
* **cURL Command**:
```bash
curl -X POST http://localhost:8080/api/admin/quizzes/1/questions \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is the capital of France?",
    "optionA": "Berlin",
    "optionB": "Madrid",
    "optionC": "Paris",
    "optionD": "Rome",
    "correctAnswer": "C"
  }'
```
* **Expected Response**:
```json
{
  "questionId": 1,
  "questionText": "What is the capital of France?",
  "optionA": "Berlin",
  "optionB": "Madrid",
  "optionC": "Paris",
  "optionD": "Rome"
}
```

#### C. Add Question 2 to the Quiz (Admin only)
* **Endpoint**: `POST http://localhost:8080/api/admin/quizzes/1/questions`
* **cURL Command**:
```bash
curl -X POST http://localhost:8080/api/admin/quizzes/1/questions \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "Which planet is known as the Red Planet?",
    "optionA": "Earth",
    "optionB": "Mars",
    "optionC": "Jupiter",
    "optionD": "Saturn",
    "correctAnswer": "B"
  }'
```

---

### Step 4: User Quiz Taking Flow

Now we act as the player (`user_tester`) using the `<USER_TOKEN>`.

#### A. Join/Start the Quiz
* **Endpoint**: `POST http://localhost:8080/api/attempts/join`
* **cURL Command**: (Replace `QZ-XXXXXX` with the quizCode generated in Step 3.A)
```bash
curl -X POST http://localhost:8080/api/attempts/join \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "quizCode": "QZ-XXXXXX"
  }'
```
* **Expected Response**:
```json
{
  "attemptId": 1,
  "quizTitle": "General Trivia",
  "totalQuestions": 2,
  "firstQuestion": {
    "questionId": 1,
    "questionText": "What is the capital of France?",
    "optionA": "Berlin",
    "optionB": "Madrid",
    "optionC": "Paris",
    "optionD": "Rome"
  }
}
```
> [!NOTE]
> Save the `attemptId` (e.g. `1`) from the response.

#### B. Submit Answer to Question 1
* **Endpoint**: `POST http://localhost:8080/api/attempts/1/submit` (Replace `1` with the attempt ID)
* **cURL Command**:
```bash
curl -X POST http://localhost:8080/api/attempts/1/submit \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": 1,
    "selectedAnswer": "C"
  }'
```
* **Expected Response**:
```json
{
  "correct": true,
  "correctAnswer": "C",
  "score": 1,
  "isLastQuestion": false,
  "completed": false,
  "percentage": null
}
```

#### C. Fetch Next Question
* **Endpoint**: `GET http://localhost:8080/api/attempts/1/next`
* **cURL Command**:
```bash
curl -X GET http://localhost:8080/api/attempts/1/next \
  -H "Authorization: Bearer <USER_TOKEN>"
```
* **Expected Response**: Contains details of Question 2 (Red Planet).

#### D. Submit Answer to Question 2 (Completing the Quiz)
* **Endpoint**: `POST http://localhost:8080/api/attempts/1/submit`
* **cURL Command**:
```bash
curl -X POST http://localhost:8080/api/attempts/1/submit \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": 2,
    "selectedAnswer": "B"
  }'
```
* **Expected Response**:
```json
{
  "correct": true,
  "correctAnswer": "B",
  "score": 2,
  "isLastQuestion": true,
  "completed": true,
  "percentage": 100.0
}
```

---

### Step 5: View History and Leaderboards

#### A. Get User's Past Attempt History
* **Endpoint**: `GET http://localhost:8080/api/attempts/history`
* **cURL Command**:
```bash
curl -X GET http://localhost:8080/api/attempts/history \
  -H "Authorization: Bearer <USER_TOKEN>"
```
* **Expected Response**: A JSON array containing the attempt details, percentages, and timestamps.

#### B. Get Quiz-Specific Leaderboard
* **Endpoint**: `GET http://localhost:8080/api/leaderboard/quiz/1`
* **cURL Command**:
```bash
curl -X GET http://localhost:8080/api/leaderboard/quiz/1 \
  -H "Authorization: Bearer <USER_TOKEN>"
```
* **Expected Response**: Rankings of all players for this quiz, ordered by highest percentage.

#### C. Get Overall Leaderboard
* **Endpoint**: `GET http://localhost:8080/api/leaderboard/overall`
* **cURL Command**:
```bash
curl -X GET http://localhost:8080/api/leaderboard/overall \
  -H "Authorization: Bearer <USER_TOKEN>"
```
* **Expected Response**: Users ranked by their average percentage across all quizzes they've taken.
