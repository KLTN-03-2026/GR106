package com.farmapp.farmsmartmanagement.infrastructure.payment.vnpay;

import com.farmapp.farmsmartmanagement.config.app.VNPayProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Utility class cho VNPay:
 *  - Build payment URL
 *  - Tính HMAC-SHA512 signature
 *  - Verify callback signature
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VNPayUtil {

    private static final DateTimeFormatter VNPAY_DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final VNPayProperties props;

    // ─── Signature ───────────────────────────────────────────────

    public String hmacSHA512(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec key = new SecretKeySpec(
                    props.getHashSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(key);
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : raw) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute HMAC-SHA512", e);
        }
    }

    /**
     * Build chuỗi hash data từ params (đã sort theo key, URL-encoded).
     * Theo spec VNPay 2.1.0: loại bỏ vnp_SecureHash và vnp_SecureHashType
     */
    public String buildHashData(Map<String, String> params) {
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);
        StringBuilder sb = new StringBuilder();
        for (String k : keys) {
            if (k.equals("vnp_SecureHash") || k.equals("vnp_SecureHashType")) continue;
            String val = params.get(k);
            if (val != null && !val.isBlank()) {
                if (sb.length() > 0) sb.append("&");
                sb.append(URLEncoder.encode(k, StandardCharsets.US_ASCII))
                        .append("=")
                        .append(URLEncoder.encode(val, StandardCharsets.US_ASCII));
            }
        }
        return sb.toString();
    }

    /** Verify chữ ký từ callback VNPay */
    public boolean verifySignature(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) return false;

        String hashData = buildHashData(params);
        String computedHash = hmacSHA512(hashData);
        return computedHash.equalsIgnoreCase(receivedHash);
    }

    // ─── Build payment URL ────────────────────────────────────────

    /**
     * Tạo URL redirect sang VNPay.
     *
     * @param orderCode   mã đơn hàng nội bộ (vnp_TxnRef)
     * @param amount      số tiền (VND, KHÔNG nhân 100 — method này sẽ tự nhân)
     * @param orderInfo   mô tả đơn hàng
     * @param ipAddress   IP người dùng
     * @param bankCode    mã ngân hàng nếu chọn trước (nullable)
     */
    public String buildPaymentUrl(String orderCode,
                                  long amount,
                                  String orderInfo,
                                  String ipAddress,
                                  String bankCode) {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        LocalDateTime expiry = now.plusMinutes(props.getExpireMinutes());

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version",    props.getVersion());
        params.put("vnp_Command",    props.getCommand());
        params.put("vnp_TmnCode",    props.getTmnCode());
        params.put("vnp_Amount",     String.valueOf(amount * 100));   // VNPay nhận đơn vị x100
        params.put("vnp_CurrCode",   props.getCurrCode());
        params.put("vnp_TxnRef",     orderCode);
        params.put("vnp_OrderInfo",  orderInfo);
        params.put("vnp_OrderType",  "other");
        params.put("vnp_Locale",     props.getLocale());
        params.put("vnp_ReturnUrl",  props.getReturnUrl());
        params.put("vnp_IpAddr",     ipAddress != null ? ipAddress : "127.0.0.1");
        params.put("vnp_CreateDate", now.format(VNPAY_DATE_FORMAT));
        params.put("vnp_ExpireDate", expiry.format(VNPAY_DATE_FORMAT));

        if (bankCode != null && !bankCode.isBlank()) {
            params.put("vnp_BankCode", bankCode);
        }

        String hashData = buildHashData(params);
        String secureHash = hmacSHA512(hashData);

        StringBuilder url = new StringBuilder(props.getPayUrl()).append("?");
        params.forEach((k, v) -> {
            if (url.charAt(url.length() - 1) != '?') url.append("&");
            url.append(URLEncoder.encode(k, StandardCharsets.US_ASCII))
                    .append("=")
                    .append(URLEncoder.encode(v, StandardCharsets.US_ASCII));
        });
        url.append("&vnp_SecureHash=").append(secureHash);

        return url.toString();
    }

    // ─── Date helpers ─────────────────────────────────────────────

    public String nowFormatted() {
        return LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).format(VNPAY_DATE_FORMAT);
    }

    public LocalDateTime parseVNPayDate(String dateStr) {
        return LocalDateTime.parse(dateStr, VNPAY_DATE_FORMAT);
    }
}