package com.quizapp.service;

import com.quizapp.dto.JoinQuizRequestDTO;
import com.quizapp.dto.JoinQuizResponseDTO;
import com.quizapp.dto.QuestionResponse;
import com.quizapp.dto.SubmitAnswerRequest;
import com.quizapp.dto.SubmitAnswerResponse;
import com.quizapp.dto.QuizAttemptHistoryResponse;
import com.quizapp.dto.LeaderboardEntry;
import com.quizapp.dto.OverallLeaderboardEntry;
import java.util.List;

public interface QuizAttemptService {

    JoinQuizResponseDTO joinQuiz(JoinQuizRequestDTO request);

    SubmitAnswerResponse submitAnswer(Long attemptId, SubmitAnswerRequest request);

    QuestionResponse getNextQuestion(Long attemptId);

    List<QuizAttemptHistoryResponse> getUserAttemptHistory(String email);

    List<LeaderboardEntry> getLeaderboardByQuiz(Long quizId);

    List<OverallLeaderboardEntry> getOverallLeaderboard();
}