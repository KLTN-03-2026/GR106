package com.farmapp.farmsmartmanagement.common.annotation;

import com.farmapp.farmsmartmanagement.domain.enums.LimitType;
import com.farmapp.farmsmartmanagement.domain.enums.SubscriptionFeature;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// Annotation đánh dấu endpoint cần check subscription
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresSubscription {
    SubscriptionFeature[] features() default {};  // feature cần có
    boolean checkLimits() default false;           // có check giới hạn không
    LimitType limitType() default LimitType.NONE;  // loại giới hạn
}


