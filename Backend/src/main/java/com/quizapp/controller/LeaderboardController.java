package com.quizapp.controller;

import com.quizapp.dto.LeaderboardEntry;
import com.quizapp.dto.OverallLeaderboardEntry;
import com.quizapp.service.QuizAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final QuizAttemptService quizAttemptService;

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<LeaderboardEntry>> getQuizLeaderboard(
            @PathVariable Long quizId) {

        return ResponseEntity.ok(
                quizAttemptService.getLeaderboardByQuiz(quizId)
        );
    }

    @GetMapping("/overall")
    public ResponseEntity<List<OverallLeaderboardEntry>> getOverallLeaderboard() {

        return ResponseEntity.ok(
                quizAttemptService.getOverallLeaderboard()
        );
    }
}
