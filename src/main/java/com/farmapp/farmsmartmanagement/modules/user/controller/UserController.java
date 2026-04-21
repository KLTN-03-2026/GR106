package com.farmapp.farmsmartmanagement.modules.user.controller;


import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.common.response.ResponseUtil;
import com.farmapp.farmsmartmanagement.modules.user.dto.response.UserResponse;
import com.farmapp.farmsmartmanagement.modules.user.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;

    @GetMapping("/api/v1/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers()
    {
        return ResponseUtil.success(
                userService.getUsers()
        );
    }

    @GetMapping("/api/v1/users/not-verified")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsersNotVerified()
    {
        return ResponseUtil.success(
                userService.getUsersNotYetVerified()
        );
    }



    @DeleteMapping("/api/v1/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable("userId") UUID userId)
    {
        userService.deleteUserNotYetVerify(userId);

        return ResponseUtil.noContent();
    }
}
