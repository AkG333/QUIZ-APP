package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;
import com.quizapp.enums.Difficulty;

@Data
@Builder
public class QuizResponse {

    private Long id;

    private String title;

    private String quizCode;

    private boolean passwordProtected;

    private int totalQuestions;

    private Difficulty difficulty;

    private Integer timeLimit;

    private boolean randomizeQuestions;
}