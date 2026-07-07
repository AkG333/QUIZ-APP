package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LeaderboardEntry {
    private String username;
    private Integer score;
    private Integer totalQuestions;
    private Double percentage;
    private LocalDateTime completedAt;
}
