package com.quizapp.repository;

import com.quizapp.entity.AttemptAnswer;
import com.quizapp.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {

    List<AttemptAnswer> findByQuizAttempt(QuizAttempt quizAttempt);

}