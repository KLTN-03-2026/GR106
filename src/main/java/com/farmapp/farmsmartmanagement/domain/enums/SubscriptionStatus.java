package com.farmapp.farmsmartmanagement.domain.enums;

public enum SubscriptionStatus {
    TRIAL,
    ACTIVE,
    PENDING,
    EXPIRED,
    CANCELLED,
    GRACE_PERIOD // Thời gian trống để cho phép user gia hạn
}