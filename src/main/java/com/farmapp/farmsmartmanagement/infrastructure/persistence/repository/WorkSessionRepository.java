package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WorkSessionEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkSessionRepository extends JpaRepository<WorkSessionEntity, UUID> {

    // Session đang mở của 1 employee
    Optional<WorkSessionEntity> findByEmployee_IdAndCheckedOutAtIsNull(UUID employeeId);

    // Tất cả session đang mở của 1 task
    List<WorkSessionEntity> findAllByTask_IdAndCheckedOutAtIsNull(UUID taskId);

    // Tất cả session đang mở của 1 farm (cho dashboard cấp trên)
    List<WorkSessionEntity> findAllByFarm_IdAndCheckedOutAtIsNull(UUID farmId);

    // Có session đang mở trong task không
    boolean existsByTask_IdAndCheckedOutAtIsNull(UUID taskId);

    // Có session đang mở trong stage không (join qua task)
    @Query("""
        SELECT COUNT(ws) > 0
        FROM WorkSessionEntity ws
        WHERE ws.task.planStage.id = :stageId
          AND ws.checkedOutAt IS NULL
    """)
    boolean existsOpenSessionByStageId(@Param("stageId") UUID stageId);

    // Có session đang mở trong plan không
    @Query("""
        SELECT COUNT(ws) > 0
        FROM WorkSessionEntity ws
        WHERE ws.task.planStage.plan.id = :planId
          AND ws.checkedOutAt IS NULL
    """)
    boolean existsOpenSessionByPlanId(@Param("planId") UUID planId);

    // Lấy tất cả session đang mở của 1 stage (để force-close)
    @Query("""
        SELECT ws
        FROM WorkSessionEntity ws
        WHERE ws.task.planStage.id = :stageId
          AND ws.checkedOutAt IS NULL
    """)
    List<WorkSessionEntity> findOpenSessionsByStageId(@Param("stageId") UUID stageId);

    // Lấy tất cả session đang mở của 1 plan (để force-close)
    @Query("""
        SELECT ws
        FROM WorkSessionEntity ws
        WHERE ws.task.planStage.plan.id = :planId
          AND ws.checkedOutAt IS NULL
    """)
    List<WorkSessionEntity> findOpenSessionsByPlanId(@Param("planId") UUID planId);

    // Lịch sử session của employee theo task
    List<WorkSessionEntity> findAllByTask_IdAndEmployee_IdOrderByCheckedInAtDesc(
            UUID taskId, UUID employeeId);

    @Modifying
    @Query(value = """
    INSERT INTO work_sessions (
        id,
        task_id,
        farm_id,
        employee_id,
        checked_in_at,
        check_in_note,
        created_at
    )
    SELECT
        gen_uuidv7(),
        t.id,
        t.farm_id,
        :userId,
        now(),
        :note,
        now()
    FROM tasks t
    WHERE t.id = :taskId
      AND t.farm_id = :farmId
      AND t.deleted_at IS NULL
      AND t.status_code NOT IN ('COMPLETED', 'CANCELLED')
      AND NOT EXISTS (
            SELECT 1
            FROM work_sessions ws
            WHERE ws.employee_id = :userId
              AND ws.checked_out_at IS NULL
      )
    """, nativeQuery = true)
    int atomicCheckIn(UUID taskId,
                      UUID farmId,
                      UUID userId,
                      String note);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ws FROM WorkSessionEntity ws WHERE ws.id = :sessionId")
    Optional<WorkSessionEntity> findByIdForUpdate(@Param("sessionId") UUID sessionId);

    boolean existsByEmployee_IdAndCheckedOutAtIsNull(UUID userId);
}