package com.quizapp.service.Impl;

import com.quizapp.dto.JoinQuizRequestDTO;
import com.quizapp.dto.JoinQuizResponseDTO;
import com.quizapp.dto.QuestionResponse;
import com.quizapp.entity.Question;
import com.quizapp.entity.Quiz;
import com.quizapp.entity.QuizAttempt;
import com.quizapp.entity.User;
import com.quizapp.repository.QuizAttemptRepository;
import com.quizapp.repository.QuizRepository;
import com.quizapp.service.QuizAttemptService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class QuizAttemptServiceImpl implements QuizAttemptService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public QuizAttemptServiceImpl(
            QuizRepository quizRepository,
            QuizAttemptRepository quizAttemptRepository) {

        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
    }

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

        QuizAttempt attempt = QuizAttempt.builder()
                .user(user)
                .quiz(quiz)
                .score(0)
                .currentQuestionIndex(0)
                .totalQuestions(quiz.getQuestions().size())
                .completed(false)
                .percentage(0.0)
                .startedAt(LocalDateTime.now())
                .build();

        quizAttemptRepository.save(attempt);

        if (quiz.getQuestions().isEmpty()) {
            throw new RuntimeException("Quiz contains no questions");
        }

        Question firstQuestion = quiz.getQuestions().get(0);

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
                .totalQuestions(quiz.getQuestions().size())
                .firstQuestion(questionDTO)
                .build();
    }
}