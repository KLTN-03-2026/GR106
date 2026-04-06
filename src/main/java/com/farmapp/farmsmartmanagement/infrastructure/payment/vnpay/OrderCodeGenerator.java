package com.farmapp.farmsmartmanagement.infrastructure.payment.vnpay;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Tạo mã đơn hàng duy nhất theo format: FSM{yyyyMMddHHmmss}{6 random digits}
 * VD: FSM20241215143022847291
 *
 * Thoả mãn VNPay constraint: vnp_TxnRef tối đa 100 ký tự, chỉ chứa [a-zA-Z0-9_-]
 */
@Component
@RequiredArgsConstructor
public class OrderCodeGenerator {

    private static final DateTimeFormatter TS_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    public String generate() {
        String ts = LocalDateTime.now().format(TS_FORMAT);
        int rand = ThreadLocalRandom.current().nextInt(100000, 999999);
        return "FSM" + ts + rand;
    }
}