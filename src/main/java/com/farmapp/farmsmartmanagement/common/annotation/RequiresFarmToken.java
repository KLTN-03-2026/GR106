package com.farmapp.farmsmartmanagement.common.annotation;

import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresFarmToken {}
// Đăng ký annotation