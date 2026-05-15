package com.farmapp.farmsmartmanagement.common.annotation;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.BeanProperty;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.deser.ContextualDeserializer;

import java.io.IOException;

public class SanitizeDeserializer extends JsonDeserializer<String>
        implements ContextualDeserializer {

    private boolean trim = true;
    private boolean normalizeSpaces = true;

    @Override
    public String deserialize(JsonParser p, DeserializationContext ctx)
            throws IOException {

        String value = p.getText();
        if (value == null) return null;

        if (trim) {
            value = value.strip(); // bỏ khoảng trắng đầu/cuối
        }
        if (normalizeSpaces) {
            value = value.replaceAll("\\s+", " "); // bỏ khoảng trắng dư giữa chữ
        }

        return value.isEmpty() ? null : value;
    }

    // Đọc config từ @Sanitize trên field
    @Override
    public JsonDeserializer<?> createContextual(DeserializationContext ctx,
                                                BeanProperty property) {
        if (property != null) {
            Sanitize annotation = property.getAnnotation(Sanitize.class);
            if (annotation != null) {
                SanitizeDeserializer deserializer = new SanitizeDeserializer();
                deserializer.trim = annotation.trim();
                deserializer.normalizeSpaces = annotation.normalizeSpaces();
                return deserializer;
            }
        }
        return this;
    }

}