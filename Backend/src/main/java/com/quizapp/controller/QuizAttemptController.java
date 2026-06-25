package com.quizapp.controller;

import com.quizapp.dto.JoinQuizRequestDTO;
import com.quizapp.dto.JoinQuizResponseDTO;
import com.quizapp.service.QuizAttemptService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/attempt")
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;

    public QuizAttemptController(QuizAttemptService quizAttemptService) {
        this.quizAttemptService = quizAttemptService;
    }

    @PostMapping("/join")
    public ResponseEntity<JoinQuizResponseDTO> joinQuiz(
            @RequestBody JoinQuizRequestDTO request) {

        return ResponseEntity.ok(
                quizAttemptService.joinQuiz(request)
        );
    }
}