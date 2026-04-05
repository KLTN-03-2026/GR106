package com.farmapp.farmsmartmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(exclude = {
        RedisRepositoriesAutoConfiguration.class
})
@EnableAsync
public class FarmSmartManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(FarmSmartManagementApplication.class, args);
    }
}