package com.quizapp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JoinQuizRequestDTO {

    private String quizCode;

    private String password;

}