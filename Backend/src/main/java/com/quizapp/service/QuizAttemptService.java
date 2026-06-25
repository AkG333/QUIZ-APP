package com.quizapp.service;

import com.quizapp.dto.JoinQuizRequestDTO;
import com.quizapp.dto.JoinQuizResponseDTO;

public interface QuizAttemptService {

    JoinQuizResponseDTO joinQuiz(JoinQuizRequestDTO request);

}