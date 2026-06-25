package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User who is taking the quiz
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Quiz being attempted
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    // Current score while quiz is in progress
    private Integer score;

    // Total questions in this quiz
    private Integer totalQuestions;

    // Current question index
    private Integer currentQuestionIndex;

    // Final percentage
    private Double percentage;

    // Whether quiz is completed
    private Boolean completed;

    // Quiz started time
    private LocalDateTime startedAt;

    // Quiz finished time
    private LocalDateTime completedAt;
}