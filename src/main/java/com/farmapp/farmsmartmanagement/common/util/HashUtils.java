package com.farmapp.farmsmartmanagement.common.util;

import java.security.MessageDigest;
import java.util.HexFormat;

public class HashUtils {

    public static String sha256(String val) {
        try {
            var md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(val.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}