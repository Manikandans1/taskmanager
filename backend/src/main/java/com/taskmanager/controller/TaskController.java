package com.taskmanager.controller;

import com.taskmanager.dto.*;
import com.taskmanager.entity.Priority;
import com.taskmanager.entity.Status;
import com.taskmanager.security.UserPrincipal;
import com.taskmanager.service.AiService;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final AiService aiService;

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority
    ) {
        return ResponseEntity.ok(taskService.getTasks(principal.getUser(), status, priority));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(taskService.getTask(principal.getUser(), id));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TaskRequest request
    ) {
        TaskResponse created = taskService.createTask(principal.getUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request
    ) {
        return ResponseEntity.ok(taskService.updateTask(principal.getUser(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        taskService.deleteTask(principal.getUser(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorderTasks(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ReorderRequest request
    ) {
        taskService.reorderTasks(principal.getUser(), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ai-suggest")
    public ResponseEntity<AiSuggestResponse> aiSuggest(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AiSuggestRequest request
    ) {
        return ResponseEntity.ok(aiService.suggest(request.getTitle()));
    }
}
