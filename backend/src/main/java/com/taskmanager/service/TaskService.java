package com.taskmanager.service;

import com.taskmanager.dto.ReorderRequest;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.Priority;
import com.taskmanager.entity.Status;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public List<TaskResponse> getTasks(User user, Status status, Priority priority) {
        List<Task> tasks;

        if (status != null && priority != null) {
            tasks = taskRepository.findByUserAndStatusAndPriorityOrderByPositionAscCreatedAtDesc(user, status, priority);
        } else if (status != null) {
            tasks = taskRepository.findByUserAndStatusOrderByPositionAscCreatedAtDesc(user, status);
        } else if (priority != null) {
            tasks = taskRepository.findByUserAndPriorityOrderByPositionAscCreatedAtDesc(user, priority);
        } else {
            tasks = taskRepository.findByUserOrderByPositionAscCreatedAtDesc(user);
        }

        return tasks.stream().map(TaskResponse::fromEntity).toList();
    }

    public TaskResponse getTask(User user, Long taskId) {
        Task task = findOwnedTask(user, taskId);
        return TaskResponse.fromEntity(task);
    }

    @Transactional
    public TaskResponse createTask(User user, TaskRequest request) {
        // New tasks go to the end of their status column by default.
        List<Task> existingInStatus = taskRepository.findByUserAndStatusOrderByPositionAsc(user, request.getStatus());
        int nextPosition = existingInStatus.isEmpty()
                ? 0
                : existingInStatus.get(existingInStatus.size() - 1).getPosition() + 1;

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .priority(request.getPriority())
                .status(request.getStatus())
                .position(nextPosition)
                .user(user)
                .build();

        return TaskResponse.fromEntity(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTask(User user, Long taskId, TaskRequest request) {
        Task task = findOwnedTask(user, taskId);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        if (request.getPosition() != null) {
            task.setPosition(request.getPosition());
        }

        return TaskResponse.fromEntity(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(User user, Long taskId) {
        Task task = findOwnedTask(user, taskId);
        taskRepository.delete(task);
    }

    /**
     * Applies a drag-and-drop reorder: moves a task into targetStatus (if different)
     * and re-numbers positions for every task in that column to match orderedTaskIds.
     */
    @Transactional
    public void reorderTasks(User user, ReorderRequest request) {
        List<Long> orderedIds = request.getOrderedTaskIds();

        for (int i = 0; i < orderedIds.size(); i++) {
            Task task = findOwnedTask(user, orderedIds.get(i));
            task.setPosition(i);
            task.setStatus(request.getTargetStatus());
            taskRepository.save(task);
        }
    }

    private Task findOwnedTask(User user, Long taskId) {
        return taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
    }
}
