package com.quizapp;

import com.quizapp.dto.*;
import com.quizapp.entity.*;
import com.quizapp.enums.Role;
import com.quizapp.repository.*;
import com.quizapp.service.Impl.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class QuizAppControllerTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private QuizAttemptRepository quizAttemptRepository;

    @Mock
    private AttemptAnswerRepository attemptAnswerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    @InjectMocks
    private QuizServiceImpl quizService;

    @InjectMocks
    private QuestionServiceImpl questionService;

    @InjectMocks
    private QuizAttemptServiceImpl quizAttemptService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterUser() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@email.com");
        request.setPassword("password");
        request.setRole("USER");

        when(userRepository.existsByEmail("test@email.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encoded_password");

        String response = userService.register(request);
        assertEquals("User Registered Successfully", response);

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterAdmin() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("adminuser");
        request.setEmail("admin@email.com");
        request.setPassword("password");
        request.setRole("ADMIN");

        when(userRepository.existsByEmail("admin@email.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encoded_password");

        String response = userService.register(request);
        assertEquals("User Registered Successfully", response);

        verify(userRepository, times(1)).save(argThat(user -> user.getRole() == Role.ROLE_ADMIN));
    }

    @Test
    void testCreateQuiz() {
        CreateQuizRequest request = new CreateQuizRequest();
        request.setTitle("Java Basics");
        request.setPasswordProtected(false);

        Quiz quiz = Quiz.builder()
                .id(1L)
                .title("Java Basics")
                .quizCode("QZ-123456")
                .passwordProtected(false)
                .questions(new ArrayList<>())
                .build();

        when(quizRepository.save(any(Quiz.class))).thenReturn(quiz);

        QuizResponse response = quizService.createQuiz(request);
        assertNotNull(response);
        assertEquals("Java Basics", response.getTitle());
        assertEquals("QZ-123456", response.getQuizCode());
    }

    @Test
    void testAddQuestion() {
        CreateQuestionRequest request = new CreateQuestionRequest();
        request.setQuestionText("What is Java?");
        request.setOptionA("A language");
        request.setOptionB("A coffee");
        request.setOptionC("A car");
        request.setOptionD("An OS");
        request.setCorrectAnswer("A");

        Quiz quiz = new Quiz();
        quiz.setId(1L);

        Question question = Question.builder()
                .id(10L)
                .questionText("What is Java?")
                .optionA("A language")
                .optionB("A coffee")
                .optionC("A car")
                .optionD("An OS")
                .correctAnswer("A")
                .quiz(quiz)
                .build();

        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(questionRepository.save(any(Question.class))).thenReturn(question);

        QuestionResponse response = questionService.addQuestionToQuiz(1L, request);
        assertNotNull(response);
        assertEquals("What is Java?", response.getQuestionText());
    }

    @Test
    void testSubmitAnswer() {
        QuizAttempt attempt = new QuizAttempt();
        attempt.setId(100L);
        attempt.setCompleted(false);
        attempt.setCurrentQuestionIndex(0);
        attempt.setScore(0);

        Quiz quiz = new Quiz();
        Question question = Question.builder()
                .id(5L)
                .correctAnswer("A")
                .build();
        quiz.setQuestions(List.of(question));
        attempt.setQuiz(quiz);

        when(quizAttemptRepository.findById(100L)).thenReturn(Optional.of(attempt));

        SubmitAnswerRequest request = new SubmitAnswerRequest();
        request.setQuestionId(5L);
        request.setSelectedAnswer("A");

        SubmitAnswerResponse response = quizAttemptService.submitAnswer(100L, request);
        assertTrue(response.getCorrect());
        assertEquals(1, response.getScore());
        assertTrue(response.getCompleted());
    }
}
