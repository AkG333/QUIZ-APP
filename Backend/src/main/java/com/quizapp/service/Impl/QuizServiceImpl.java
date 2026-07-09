package com.quizapp.service.Impl;

import com.quizapp.dto.CreateQuizRequest;
import com.quizapp.dto.QuizResponse;
import com.quizapp.entity.Quiz;
import com.quizapp.entity.User;
import com.quizapp.enums.Difficulty;
import com.quizapp.enums.Role;
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
                .difficulty(request.getDifficulty() != null ? request.getDifficulty() : Difficulty.EASY)
                .timeLimit(request.getTimeLimit())
                .randomizeQuestions(request.isRandomizeQuestions())
                .quizCode(QuizCodeGenerator.generateCode())
                .createdAt(LocalDateTime.now())
                .createdBy(currentUser)
                .build();

        Quiz savedQuiz = quizRepository.save(quiz);

        return mapToResponse(savedQuiz);
    }

    @Override
    public List<QuizResponse> getAllQuizzes() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = null;
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User principal = (User) authentication.getPrincipal();
            currentUser = userRepository.findByEmail(principal.getEmail()).orElse(null);
        }

        if (currentUser != null && currentUser.getRole() == Role.ROLE_ADMIN) {
            return quizRepository.findByCreatedBy(currentUser)
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        } else {
            return quizRepository.findAll()
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }
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

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User principal = (User) authentication.getPrincipal();
            User currentUser = userRepository.findByEmail(principal.getEmail()).orElse(null);
            if (currentUser != null && currentUser.getRole() == Role.ROLE_ADMIN) {
                if (quiz.getCreatedBy() != null && !quiz.getCreatedBy().getId().equals(currentUser.getId())) {
                    throw new RuntimeException("Unauthorized to update this quiz");
                }
            }
        }

        quiz.setTitle(request.getTitle());
        quiz.setQuizPassword(request.getQuizPassword());
        quiz.setPasswordProtected(request.isPasswordProtected());
        quiz.setDifficulty(request.getDifficulty() != null ? request.getDifficulty() : Difficulty.EASY);
        quiz.setTimeLimit(request.getTimeLimit());
        quiz.setRandomizeQuestions(request.isRandomizeQuestions());

        Quiz savedQuiz = quizRepository.save(quiz);
        return mapToResponse(savedQuiz);
    }

    @Override
    public void deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz Not Found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User principal = (User) authentication.getPrincipal();
            User currentUser = userRepository.findByEmail(principal.getEmail()).orElse(null);
            if (currentUser != null && currentUser.getRole() == Role.ROLE_ADMIN) {
                if (quiz.getCreatedBy() != null && !quiz.getCreatedBy().getId().equals(currentUser.getId())) {
                    throw new RuntimeException("Unauthorized to delete this quiz");
                }
            }
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
                .difficulty(quiz.getDifficulty() != null ? quiz.getDifficulty() : Difficulty.EASY)
                .timeLimit(quiz.getTimeLimit() != null ? quiz.getTimeLimit() : 0)
                .randomizeQuestions(quiz.isRandomizeQuestions())
                .build();
    }
}