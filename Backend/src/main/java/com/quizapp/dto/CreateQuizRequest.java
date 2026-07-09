package com.quizapp.dto;

import lombok.Data;
import com.quizapp.enums.Difficulty;

@Data
public class CreateQuizRequest {

    private String title;

    private String quizPassword;

    private boolean passwordProtected;

    private Difficulty difficulty;

    private Integer timeLimit;

    private boolean randomizeQuestions;
}