package com.quizapp.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class JoinQuizResponseDTO {

    private Long attemptId;

    private String quizTitle;

    private Integer totalQuestions;

    private QuestionResponse firstQuestion;

}