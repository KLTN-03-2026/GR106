//package com.farmapp.farmsmartmanagement.config.database;
//
//import jakarta.persistence.EntityManager;
//import lombok.RequiredArgsConstructor;
//import org.aspectj.lang.annotation.Aspect;
//import org.aspectj.lang.annotation.Before;
//import org.springframework.stereotype.Component;
//
//@Aspect
//@Component
//@RequiredArgsConstructor
//public class RlsAspect {
//
//    private final EntityManager entityManager;
//
//    @Before("@annotation(org.springframework.transaction.annotation.Transactional)")
//    public void applyRls() {
//        String userId = RlsContext.hasUser()
//                ? RlsContext.getUserId().toString() : "";
//        String farmId = RlsContext.hasFarm()
//                ? RlsContext.getFarmId().toString() : "";
//
//        entityManager.createNativeQuery("""
//            SELECT set_config('app.current_user_id', :userId, true),
//                   set_config('app.current_farm_id', :farmId, true)
//        """)
//                .setParameter("userId",userId)
//                .setParameter("farmId", farmId)
//                .getSingleResult();
//    }
//}