package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiSuggestRequest {

    @NotBlank(message = "title is required")
    private String title;
}
