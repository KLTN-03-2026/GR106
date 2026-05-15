package com.farmapp.farmsmartmanagement.common.annotation;

import com.fasterxml.jackson.annotation.JacksonAnnotationsInside;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@JacksonAnnotationsInside
@JsonDeserialize(using = SanitizeDeserializer.class)
public @interface Sanitize {
    boolean trim() default true;          // bỏ khoảng trắng đầu/cuối
    boolean normalizeSpaces() default true; // bỏ khoảng trắng dư giữa chữ
}