package com.taskmanager.repository;

import com.taskmanager.entity.Priority;
import com.taskmanager.entity.Status;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserOrderByPositionAscCreatedAtDesc(User user);

    List<Task> findByUserAndStatusOrderByPositionAscCreatedAtDesc(User user, Status status);

    List<Task> findByUserAndPriorityOrderByPositionAscCreatedAtDesc(User user, Priority priority);

    List<Task> findByUserAndStatusAndPriorityOrderByPositionAscCreatedAtDesc(User user, Status status, Priority priority);

    Optional<Task> findByIdAndUser(Long id, User user);

    List<Task> findByUserAndStatusOrderByPositionAsc(User user, Status status);
}
