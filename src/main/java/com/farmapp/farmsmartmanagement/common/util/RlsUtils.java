package com.farmapp.farmsmartmanagement.common.util;

import com.farmapp.farmsmartmanagement.config.database.RlsContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.function.Supplier;


@Slf4j
@Component
public class RlsUtils {

    public <T> T runAsAdmin(Supplier<T> action) {
        // Lưu context hiện tại
        UUID currentFarmId = RlsContext.getFarmId();
        UUID currentUserId = RlsContext.getUserId();

        try {
            // Clear context → wrapper sẽ set empty string → is_bypass không cần
            // Hoặc thêm flag bypass vào RlsContext
            RlsContext.setBypass(true);
            return action.get();
        } finally {
            RlsContext.setBypass(false);
            // Restore context cũ
            RlsContext.set(currentFarmId, currentUserId);
        }
    }

    public void runAsAdmin(Runnable action) {
        UUID currentFarmId = RlsContext.getFarmId();
        UUID currentUserId = RlsContext.getUserId();

        try {
            RlsContext.setBypass(true);
            action.run();
        } finally {
            RlsContext.setBypass(false);
            RlsContext.set(currentFarmId, currentUserId);
        }
    }
}
