package com.quizapp.service;

import com.quizapp.dto.CreateQuestionRequest;
import com.quizapp.dto.QuestionResponse;

import java.util.List;

public interface QuestionService {

    QuestionResponse addQuestionToQuiz(
            Long quizId,
            CreateQuestionRequest request
    );

    List<QuestionResponse> getQuestionsByQuiz(
            Long quizId
    );
}