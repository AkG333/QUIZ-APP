package com.quizapp.dto;

import lombok.Data;

@Data
public class CreateQuestionRequest {

    private String questionText;

    private String optionA;

    private String optionB;

    private String optionC;

    private String optionD;

    private String correctAnswer;
}