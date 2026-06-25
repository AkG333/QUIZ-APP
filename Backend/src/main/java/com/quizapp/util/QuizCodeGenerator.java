package com.quizapp.util;

import java.util.UUID;

public class QuizCodeGenerator {

    public static String generateCode() {

        return "QZ-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 6)
                        .toUpperCase();
    }
}