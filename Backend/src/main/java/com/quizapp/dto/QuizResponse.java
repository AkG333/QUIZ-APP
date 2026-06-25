package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuizResponse {

    private Long id;

    private String title;

    private String quizCode;

    private boolean passwordProtected;

    private int totalQuestions;
}