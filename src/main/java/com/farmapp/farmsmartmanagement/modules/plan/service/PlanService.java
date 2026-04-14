package com.farmapp.farmsmartmanagement.modules.plan.service;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.PlanRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PlanService {
    PlanRepository planRepository;


}
