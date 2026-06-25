package com.quizapp.service;

import com.quizapp.dto.CreateQuizRequest;
import com.quizapp.dto.QuizResponse;

import java.util.List;

public interface QuizService {

    QuizResponse createQuiz(CreateQuizRequest request);

    List<QuizResponse> getAllQuizzes();

    QuizResponse getQuizByCode(String quizCode);
}