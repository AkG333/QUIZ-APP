package com.quizapp.dto;

import lombok.Data;

@Data
public class SubmitAnswerRequest {
    private Long questionId;
    private String selectedAnswer;
}
