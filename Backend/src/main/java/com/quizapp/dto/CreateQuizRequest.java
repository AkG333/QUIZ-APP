package com.quizapp.dto;

import lombok.Data;

@Data
public class CreateQuizRequest {

    private String title;

    private String quizPassword;

    private boolean passwordProtected;
}