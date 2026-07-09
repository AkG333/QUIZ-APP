package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.*;
import com.quizapp.enums.Difficulty;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String quizCode;

    private String quizPassword;

    private boolean passwordProtected;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    private Integer timeLimit;

    private boolean randomizeQuestions;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(
            mappedBy = "quiz",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Question> questions = new ArrayList<>();
}