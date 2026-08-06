package com.cura.chat;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;

import static org.assertj.core.api.Assertions.*;

class ChatServiceTest {

    @Test
    void chat_throwsWhenApiKeyBlank() throws IOException {
        ChatService service = new ChatService();
        // apiKey stays null — init() returns early, client stays null
        service.init();

        assertThatThrownBy(() -> service.chat("hello"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not configured");
    }

    @Test
    void init_setsClientWhenKeyProvided() throws IOException {
        ChatService service = new ChatService();
        ReflectionTestUtils.setField(service, "apiKey", "sk-ant-test-key-placeholder");

        // Should not throw — client gets built (network call only happens on chat())
        assertThatCode(service::init).doesNotThrowAnyException();
    }
}
