package com.quizapp.controller;

import com.quizapp.dto.CreateQuestionRequest;
import com.quizapp.dto.QuestionResponse;
import com.quizapp.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/quizzes")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping("/{quizId}/questions")
    public ResponseEntity<QuestionResponse>
    addQuestionToQuiz(
            @PathVariable Long quizId,
            @RequestBody CreateQuestionRequest request
    ) {

        return ResponseEntity.ok(
                questionService.addQuestionToQuiz(
                        quizId,
                        request
                )
        );
    }

    @GetMapping("/{quizId}/questions")
    public ResponseEntity<List<QuestionResponse>>
    getQuestionsByQuiz(
            @PathVariable Long quizId
    ) {

        return ResponseEntity.ok(
                questionService.getQuestionsByQuiz(
                        quizId
                )
        );
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<QuestionResponse> updateQuestion(
            @PathVariable Long questionId,
            @RequestBody CreateQuestionRequest request
    ) {

        return ResponseEntity.ok(
                questionService.updateQuestion(
                        questionId,
                        request
                )
        );
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long questionId
    ) {

        questionService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }
}