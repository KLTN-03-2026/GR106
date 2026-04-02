package com.farmapp.farmsmartmanagement.modules.audit.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final JdbcTemplate jdbc;

    public void log(UUID actorId,
                    UUID farmId,
                    String action,
                    String target,
                    UUID targetId,
                    String oldData,
                    String newData) {

        jdbc.update("""
            INSERT INTO audit_logs
            (actor_id, farm_id, action_type, target_type, target_id, old_data, new_data)
            VALUES (?, ?, ?, ?, ?, ?::jsonb, ?::jsonb)
        """,
                actorId,
                farmId,
                action,
                target,
                targetId,
                oldData,
                newData
        );
    }
}