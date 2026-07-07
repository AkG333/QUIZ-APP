package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class QuizAttemptHistoryResponse {
    private Long attemptId;
    private String quizTitle;
    private String quizCode;
    private Integer score;
    private Integer totalQuestions;
    private Double percentage;
    private Boolean completed;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
