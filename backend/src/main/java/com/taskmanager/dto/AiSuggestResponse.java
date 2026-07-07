package com.taskmanager.dto;

import com.taskmanager.entity.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSuggestResponse {
    private String description;
    private Priority priority;
}
