package com.quizapp.service.Impl;

import com.quizapp.dto.CreateQuestionRequest;
import com.quizapp.dto.QuestionResponse;
import com.quizapp.entity.Question;
import com.quizapp.entity.Quiz;
import com.quizapp.repository.QuestionRepository;
import com.quizapp.repository.QuizRepository;
import com.quizapp.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    @Override
    public QuestionResponse addQuestionToQuiz(
            Long quizId,
            CreateQuestionRequest request
    ) {

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() ->
                        new RuntimeException("Quiz Not Found"));

        Question question = Question.builder()
                .questionText(request.getQuestionText())
                .optionA(request.getOptionA())
                .optionB(request.getOptionB())
                .optionC(request.getOptionC())
                .optionD(request.getOptionD())
                .correctAnswer(request.getCorrectAnswer())
                .quiz(quiz)
                .build();

        Question savedQuestion =
                questionRepository.save(question);

        return mapToResponse(savedQuestion);
    }

    @Override
    public List<QuestionResponse> getQuestionsByQuiz(
            Long quizId
    ) {

        return questionRepository.findByQuizId(quizId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private QuestionResponse mapToResponse(
            Question question
    ) {

        return QuestionResponse.builder()
                .questionId(question.getId())
                .questionText(question.getQuestionText())
                .optionA(question.getOptionA())
                .optionB(question.getOptionB())
                .optionC(question.getOptionC())
                .optionD(question.getOptionD())
                .build();
    }
}