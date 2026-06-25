package com.quizapp.repository;

import com.quizapp.entity.QuizAttempt;
import com.quizapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByUser(User user);

}