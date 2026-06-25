package com.quizapp.controller;

import com.quizapp.dto.CreateQuizRequest;
import com.quizapp.dto.QuizResponse;
import com.quizapp.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping
    public ResponseEntity<QuizResponse> createQuiz(
            @RequestBody CreateQuizRequest request) {

        return ResponseEntity.ok(
                quizService.createQuiz(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<QuizResponse>> getAllQuizzes() {

        return ResponseEntity.ok(
                quizService.getAllQuizzes()
        );
    }

    @GetMapping("/code/{quizCode}")
    public ResponseEntity<QuizResponse> getQuizByCode(
            @PathVariable String quizCode) {

        return ResponseEntity.ok(
                quizService.getQuizByCode(quizCode)
        );
    }
}