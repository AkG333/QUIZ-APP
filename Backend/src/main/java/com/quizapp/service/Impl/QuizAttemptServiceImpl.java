package com.quizapp.service.Impl;

import com.quizapp.dto.*;
import com.quizapp.entity.*;
import com.quizapp.repository.*;
import com.quizapp.service.QuizAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizAttemptServiceImpl implements QuizAttemptService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final UserRepository userRepository;

    @Override
    public JoinQuizResponseDTO joinQuiz(JoinQuizRequestDTO request) {

        Quiz quiz = quizRepository
                .findByQuizCode(request.getQuizCode())
                .orElseThrow(() ->
                        new RuntimeException("Quiz not found"));

        if (quiz.isPasswordProtected()) {

            if (request.getPassword() == null ||
                    !quiz.getQuizPassword().equals(request.getPassword())) {

                throw new RuntimeException("Invalid Quiz Password");
            }
        }

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User user = (User) authentication.getPrincipal();
        User attachedUser = userRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Question> questions = quiz.getQuestions();
        if (questions.isEmpty()) {
            throw new RuntimeException("Quiz contains no questions");
        }

        List<Long> questionIds = new ArrayList<>(questions.stream().map(Question::getId).toList());
        if (quiz.isRandomizeQuestions()) {
            Collections.shuffle(questionIds);
        }
        String questionOrder = questionIds.stream().map(String::valueOf).collect(Collectors.joining(","));

        QuizAttempt attempt = QuizAttempt.builder()
                .user(attachedUser)
                .quiz(quiz)
                .score(0)
                .currentQuestionIndex(0)
                .totalQuestions(questions.size())
                .questionOrder(questionOrder)
                .completed(false)
                .percentage(0.0)
                .startedAt(LocalDateTime.now())
                .build();

        quizAttemptRepository.save(attempt);

        Long firstQuestionId = questionIds.get(0);
        Question firstQuestion = questions.stream()
                .filter(q -> q.getId().equals(firstQuestionId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Question not found in sequence"));

        QuestionResponse questionDTO =
                QuestionResponse.builder()
                        .questionId(firstQuestion.getId())
                        .questionText(firstQuestion.getQuestionText())
                        .optionA(firstQuestion.getOptionA())
                        .optionB(firstQuestion.getOptionB())
                        .optionC(firstQuestion.getOptionC())
                        .optionD(firstQuestion.getOptionD())
                        .build();

        return JoinQuizResponseDTO.builder()
                .attemptId(attempt.getId())
                .quizTitle(quiz.getTitle())
                .totalQuestions(questions.size())
                .firstQuestion(questionDTO)
                .timeLimit(quiz.getTimeLimit() != null ? quiz.getTimeLimit() : 0)
                .build();
    }

    @Override
    public SubmitAnswerResponse submitAnswer(Long attemptId, SubmitAnswerRequest request) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));

        if (attempt.getCompleted()) {
            throw new RuntimeException("Quiz attempt already completed");
        }

        Quiz quiz = attempt.getQuiz();

        // Check if quiz has expired due to time limit
        if (quiz.getTimeLimit() != null && quiz.getTimeLimit() > 0) {
            LocalDateTime expiryTime = attempt.getStartedAt().plusSeconds(quiz.getTimeLimit());
            if (LocalDateTime.now().isAfter(expiryTime)) {
                attempt.setCompleted(true);
                attempt.setCompletedAt(expiryTime);
                double pct = attempt.getTotalQuestions() > 0 
                        ? ((double) attempt.getScore() / attempt.getTotalQuestions()) * 100.0
                        : 0.0;
                attempt.setPercentage(pct);
                quizAttemptRepository.save(attempt);
                throw new RuntimeException("Quiz time limit has expired");
            }
        }

        List<Question> questions = quiz.getQuestions();
        int currentIndex = attempt.getCurrentQuestionIndex();

        String questionOrderStr = attempt.getQuestionOrder();
        if (questionOrderStr == null || questionOrderStr.isEmpty()) {
            questionOrderStr = questions.stream()
                    .map(q -> String.valueOf(q.getId()))
                    .collect(Collectors.joining(","));
        }
        List<Long> questionIds = Arrays.stream(questionOrderStr.split(","))
                .map(Long::parseLong)
                .toList();

        if (currentIndex >= questionIds.size()) {
            throw new RuntimeException("No more questions to answer in this attempt");
        }

        Long currentQuestionId = questionIds.get(currentIndex);
        Question currentQuestion = questions.stream()
                .filter(q -> q.getId().equals(currentQuestionId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Question not found in sequence"));

        if (!currentQuestion.getId().equals(request.getQuestionId())) {
            throw new RuntimeException("Submitted question ID does not match current question in sequence");
        }

        boolean isCorrect = currentQuestion.getCorrectAnswer().equalsIgnoreCase(request.getSelectedAnswer().trim());

        AttemptAnswer answer = AttemptAnswer.builder()
                .quizAttempt(attempt)
                .question(currentQuestion)
                .selectedAnswer(request.getSelectedAnswer())
                .correct(isCorrect)
                .answeredAt(LocalDateTime.now())
                .build();
        attemptAnswerRepository.save(answer);

        if (isCorrect) {
            attempt.setScore(attempt.getScore() + 1);
        }
        attempt.setCurrentQuestionIndex(currentIndex + 1);

        boolean isLast = (attempt.getCurrentQuestionIndex() >= questionIds.size());
        if (isLast) {
            attempt.setCompleted(true);
            attempt.setCompletedAt(LocalDateTime.now());
            double pct = ((double) attempt.getScore() / questionIds.size()) * 100.0;
            attempt.setPercentage(pct);
        }

        quizAttemptRepository.save(attempt);

        return SubmitAnswerResponse.builder()
                .correct(isCorrect)
                .correctAnswer(currentQuestion.getCorrectAnswer())
                .score(attempt.getScore())
                .isLastQuestion(isLast)
                .completed(attempt.getCompleted())
                .percentage(attempt.getPercentage())
                .build();
    }

    @Override
    public QuestionResponse getNextQuestion(Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));

        if (attempt.getCompleted()) {
            throw new RuntimeException("Quiz attempt already completed");
        }

        Quiz quiz = attempt.getQuiz();
        List<Question> questions = quiz.getQuestions();
        int currentIndex = attempt.getCurrentQuestionIndex();

        String questionOrderStr = attempt.getQuestionOrder();
        if (questionOrderStr == null || questionOrderStr.isEmpty()) {
            questionOrderStr = questions.stream()
                    .map(q -> String.valueOf(q.getId()))
                    .collect(Collectors.joining(","));
        }
        List<Long> questionIds = Arrays.stream(questionOrderStr.split(","))
                .map(Long::parseLong)
                .toList();

        if (currentIndex >= questionIds.size()) {
            throw new RuntimeException("No more questions left in this attempt");
        }

        Long nextQuestionId = questionIds.get(currentIndex);
        Question nextQuestion = questions.stream()
                .filter(q -> q.getId().equals(nextQuestionId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Question not found"));

        return QuestionResponse.builder()
                .questionId(nextQuestion.getId())
                .questionText(nextQuestion.getQuestionText())
                .optionA(nextQuestion.getOptionA())
                .optionB(nextQuestion.getOptionB())
                .optionC(nextQuestion.getOptionC())
                .optionD(nextQuestion.getOptionD())
                .build();
    }

    @Override
    public List<QuizAttemptHistoryResponse> getUserAttemptHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<QuizAttempt> attempts = quizAttemptRepository.findByUser(user);

        return attempts.stream()
                .map(attempt -> QuizAttemptHistoryResponse.builder()
                        .attemptId(attempt.getId())
                        .quizTitle(attempt.getQuiz().getTitle())
                        .quizCode(attempt.getQuiz().getQuizCode())
                        .score(attempt.getScore())
                        .totalQuestions(attempt.getTotalQuestions())
                        .percentage(attempt.getPercentage())
                        .completed(attempt.getCompleted())
                        .startedAt(attempt.getStartedAt())
                        .completedAt(attempt.getCompletedAt())
                        .build())
                .toList();
    }

    @Override
    public List<LeaderboardEntry> getLeaderboardByQuiz(Long quizId) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndCompletedTrue(quizId);

        // Group by user id (Long), pick the one with max percentage, and sort desc
        Map<Long, QuizAttempt> bestAttempts = attempts.stream()
                .collect(Collectors.toMap(
                        attempt -> attempt.getUser().getId(),
                        Function.identity(),
                        (a1, a2) -> a1.getPercentage() >= a2.getPercentage() ? a1 : a2
                ));

        return bestAttempts.values().stream()
                .map(attempt -> LeaderboardEntry.builder()
                        .username(attempt.getUser().getUsername())
                        .score(attempt.getScore())
                        .totalQuestions(attempt.getTotalQuestions())
                        .percentage(attempt.getPercentage())
                        .completedAt(attempt.getCompletedAt())
                        .build())
                .sorted(Comparator.comparingDouble(LeaderboardEntry::getPercentage).reversed())
                .toList();
    }

    @Override
    public List<OverallLeaderboardEntry> getOverallLeaderboard() {
        List<QuizAttempt> attempts = quizAttemptRepository.findByCompletedTrue();

        Map<Long, List<QuizAttempt>> userAttempts = attempts.stream()
                .collect(Collectors.groupingBy(attempt -> attempt.getUser().getId()));

        return userAttempts.values().stream()
                .map(list -> {
                    User user = list.get(0).getUser();
                    double avgPct = list.stream().mapToDouble(QuizAttempt::getPercentage).average().orElse(0.0);
                    int totalScore = list.stream().mapToInt(QuizAttempt::getScore).sum();
                    return OverallLeaderboardEntry.builder()
                            .username(user.getUsername())
                            .averagePercentage(avgPct)
                            .quizzesAttempted(list.size())
                            .totalScore(totalScore)
                            .build();
                })
                .sorted(Comparator.comparingDouble(OverallLeaderboardEntry::getAveragePercentage).reversed())
                .toList();
    }

    @Override
    public SubmitAnswerResponse finishAttempt(Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));

        if (!attempt.getCompleted()) {
            attempt.setCompleted(true);
            attempt.setCompletedAt(LocalDateTime.now());
            double pct = attempt.getTotalQuestions() > 0 
                    ? ((double) attempt.getScore() / attempt.getTotalQuestions()) * 100.0
                    : 0.0;
            attempt.setPercentage(pct);
            quizAttemptRepository.save(attempt);
        }

        return SubmitAnswerResponse.builder()
                .correct(false)
                .correctAnswer(null)
                .score(attempt.getScore())
                .isLastQuestion(true)
                .completed(true)
                .percentage(attempt.getPercentage())
                .build();
    }
}