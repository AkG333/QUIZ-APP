package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OverallLeaderboardEntry {
    private String username;
    private Double averagePercentage;
    private Integer quizzesAttempted;
    private Integer totalScore;
}
