package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubmitAnswerResponse {
    private Boolean correct;
    private String correctAnswer;
    private Integer score;
    private Boolean isLastQuestion;
    private Double percentage;
    private Boolean completed;
}
