package com.cura.chat;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.Model;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    @Value("${anthropic.api-key}")
    private String apiKey;

    @Value("${anthropic.model:claude-haiku-4-5-20251001}")
    private String model;

    private AnthropicClient client;
    private String systemPrompt;

    @PostConstruct
    void init() throws IOException {
        if (apiKey == null || apiKey.isBlank()) {
            apiKey = System.getenv("ANTHROPIC_API_KEY");
        }
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("anthropic.api-key is not set — chat endpoint will return 503");
            return;
        }
        client = AnthropicOkHttpClient.builder()
                .apiKey(apiKey)
                .build();

        StringBuilder docs = new StringBuilder();
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:documents/*.md");

        for (Resource resource : resources) {
            String content = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            docs.append("### ").append(resource.getFilename()).append("\n")
                .append(content).append("\n\n");
        }

        systemPrompt = "You are a helpful assistant for a care home facility called Cura. "
                + "Answer questions based ONLY on the following policy documents. "
                + "If a question cannot be answered from the documents, say so politely and suggest "
                + "contacting the facility directly. Do not make up information. Be concise and friendly.\n\n"
                + "=== POLICY DOCUMENTS ===\n"
                + docs
                + "=== END OF DOCUMENTS ===";

        log.info("Chat service initialised with {} policy document(s)", resources.length);
    }

    @Cacheable(value = "chatResponses", key = "#message.toLowerCase().strip()")
    public String chat(String message) {
        if (client == null) {
            throw new IllegalStateException("Chat service unavailable: API key not configured");
        }
        MessageCreateParams params = MessageCreateParams.builder()
                .model(Model.CLAUDE_HAIKU_4_5_20251001)
                .maxTokens(512L)
                .system(systemPrompt)
                .addUserMessage(message)
                .build();

        Message response = client.messages().create(params);

        return response.content().stream()
                .flatMap(block -> block.text().stream())
                .map(textBlock -> textBlock.text())
                .findFirst()
                .orElse("I wasn't able to generate a response. Please try again.");
    }
}
