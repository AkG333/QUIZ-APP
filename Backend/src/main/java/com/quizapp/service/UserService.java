package com.quizapp.service;

import com.quizapp.dto.LoginRequest;
import com.quizapp.dto.RegisterRequest;

public interface UserService {

    String register(RegisterRequest request);

    String login(LoginRequest request);
}