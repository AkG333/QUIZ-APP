package com.quizapp.controller;

import com.quizapp.dto.*;
import com.quizapp.entity.User;
import com.quizapp.service.QuizAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;

    @PostMapping("/join")
    public ResponseEntity<JoinQuizResponseDTO> joinQuiz(
            @RequestBody JoinQuizRequestDTO request) {

        return ResponseEntity.ok(
                quizAttemptService.joinQuiz(request)
        );
    }

    @PostMapping("/{attemptId}/submit")
    public ResponseEntity<SubmitAnswerResponse> submitAnswer(
            @PathVariable Long attemptId,
            @RequestBody SubmitAnswerRequest request) {

        return ResponseEntity.ok(
                quizAttemptService.submitAnswer(attemptId, request)
        );
    }

    @GetMapping("/{attemptId}/next")
    public ResponseEntity<QuestionResponse> getNextQuestion(
            @PathVariable Long attemptId) {

        return ResponseEntity.ok(
                quizAttemptService.getNextQuestion(attemptId)
        );
    }

    @PostMapping("/{attemptId}/finish")
    public ResponseEntity<SubmitAnswerResponse> finishAttempt(
            @PathVariable Long attemptId) {

        return ResponseEntity.ok(
                quizAttemptService.finishAttempt(attemptId)
        );
    }

    @GetMapping("/history")
    public ResponseEntity<List<QuizAttemptHistoryResponse>> getAttemptHistory(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(
                quizAttemptService.getUserAttemptHistory(user.getEmail())
        );
    }
}