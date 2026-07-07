package com.quizapp.service.Impl;

import com.quizapp.dto.CreateQuizRequest;
import com.quizapp.dto.QuizResponse;
import com.quizapp.entity.Quiz;
import com.quizapp.entity.User;
import com.quizapp.repository.QuizRepository;
import com.quizapp.repository.UserRepository;
import com.quizapp.service.QuizService;
import com.quizapp.util.QuizCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final UserRepository userRepository;

    @Override
    public QuizResponse createQuiz(CreateQuizRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = null;
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User principal = (User) authentication.getPrincipal();
            currentUser = userRepository.findByEmail(principal.getEmail()).orElse(null);
        }

        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .quizPassword(request.getQuizPassword())
                .passwordProtected(request.isPasswordProtected())
                .quizCode(QuizCodeGenerator.generateCode())
                .createdAt(LocalDateTime.now())
                .createdBy(currentUser)
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

    @Override
    public QuizResponse updateQuiz(Long id, CreateQuizRequest request) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz Not Found"));

        quiz.setTitle(request.getTitle());
        quiz.setQuizPassword(request.getQuizPassword());
        quiz.setPasswordProtected(request.isPasswordProtected());

        Quiz savedQuiz = quizRepository.save(quiz);
        return mapToResponse(savedQuiz);
    }

    @Override
    public void deleteQuiz(Long id) {
        if (!quizRepository.existsById(id)) {
            throw new RuntimeException("Quiz Not Found");
        }
        quizRepository.deleteById(id);
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