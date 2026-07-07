package com.taskmanager.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.dto.AiSuggestResponse;
import com.taskmanager.entity.Priority;
import com.taskmanager.exception.AiServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Calls the Groq chat completions API (OpenAI-compatible schema) server-side only.
 * The API key never leaves the backend - the frontend only ever calls our own
 * /api/tasks/ai-suggest endpoint.
 */
@Service
public class AiService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String apiKey;
    private final String apiUrl;
    private final String model;

    public AiService(
            @Value("${app.groq.api-key}") String apiKey,
            @Value("${app.groq.api-url}") String apiUrl,
            @Value("${app.groq.model}") String model
    ) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.model = model;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public AiSuggestResponse suggest(String roughTitle) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new AiServiceException(
                    "AI suggestions are not configured on the server. Set GROQ_API_KEY as an environment variable."
            );
        }

        String systemPrompt = """
                You are a helpful assistant inside a task manager app. Given a short, rough task \
                title, respond ONLY with a compact JSON object (no markdown, no code fences, no \
                extra text) with exactly two keys:
                - "description": a clear, actionable 1-3 sentence task description expanding on the title
                - "priority": one of "LOW", "MEDIUM", or "HIGH" based on how urgent/important the task sounds

                Example output: {"description": "Investigate and fix the login failure affecting users on the authentication page. Reproduce the issue, identify the root cause, and deploy a fix.", "priority": "HIGH"}
                """;

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "temperature", 0.4,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", "Task title: " + roughTitle)
                )
        );

        try {
            String jsonBody = objectMapper.writeValueAsString(requestBody);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .timeout(Duration.ofSeconds(20))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 300) {
                throw new AiServiceException(
                        "AI provider returned an error (status " + response.statusCode() + "). Please try again."
                );
            }

            return parseGroqResponse(response.body());

        } catch (AiServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new AiServiceException("Failed to reach AI service: " + e.getMessage(), e);
        }
    }

    private AiSuggestResponse parseGroqResponse(String rawBody) {
        try {
            JsonNode root = objectMapper.readTree(rawBody);
            String content = root.path("choices").get(0).path("message").path("content").asText();

            // Defensive: strip accidental markdown code fences if the model adds them anyway.
            String cleaned = content.trim()
                    .replaceAll("^```json", "")
                    .replaceAll("^```", "")
                    .replaceAll("```$", "")
                    .trim();

            JsonNode suggestion = objectMapper.readTree(cleaned);
            String description = suggestion.path("description").asText("").trim();
            String priorityRaw = suggestion.path("priority").asText("MEDIUM").trim().toUpperCase();

            Priority priority;
            try {
                priority = Priority.valueOf(priorityRaw);
            } catch (IllegalArgumentException e) {
                priority = Priority.MEDIUM;
            }

            if (description.isBlank()) {
                throw new AiServiceException("AI returned an empty description. Please try again.");
            }

            return AiSuggestResponse.builder()
                    .description(description)
                    .priority(priority)
                    .build();

        } catch (AiServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new AiServiceException("Could not parse AI response. Please try again.", e);
        }
    }
}
