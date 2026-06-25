package com.quizapp.service.Impl;

import com.quizapp.dto.CreateQuizRequest;
import com.quizapp.dto.QuizResponse;
import com.quizapp.entity.Quiz;
import com.quizapp.repository.QuizRepository;
import com.quizapp.service.QuizService;
import com.quizapp.util.QuizCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;

    @Override
    public QuizResponse createQuiz(CreateQuizRequest request) {

        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .quizPassword(request.getQuizPassword())
                .passwordProtected(request.isPasswordProtected())
                .quizCode(QuizCodeGenerator.generateCode())
                .createdAt(LocalDateTime.now())
                .build();

        Quiz savedQuiz = quizRepository.save(quiz);

        return mapToResponse(savedQuiz);
    }

    @Override
    public List<QuizResponse> getAllQuizzes() {

        return quizRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public QuizResponse getQuizByCode(String quizCode) {

        Quiz quiz = quizRepository.findByQuizCode(quizCode)
                .orElseThrow(() ->
                        new RuntimeException("Quiz Not Found"));

        return mapToResponse(quiz);
    }

    private QuizResponse mapToResponse(Quiz quiz) {

        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .quizCode(quiz.getQuizCode())
                .passwordProtected(quiz.isPasswordProtected())
                .totalQuestions(
                        quiz.getQuestions() == null
                                ? 0
                                : quiz.getQuestions().size()
                )
                .build();
    }
}