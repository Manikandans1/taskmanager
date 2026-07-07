package com.taskmanager.dto;

import com.taskmanager.entity.Status;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Sent when the user drags a task to a new position and/or a new status column.
 * `orderedTaskIds` is the full list of task IDs in the destination column, in their new order.
 */
@Data
public class ReorderRequest {

    @NotNull(message = "targetStatus is required")
    private Status targetStatus;

    @NotNull(message = "orderedTaskIds is required")
    private List<Long> orderedTaskIds;
}
