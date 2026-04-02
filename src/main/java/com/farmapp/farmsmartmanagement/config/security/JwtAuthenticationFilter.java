package com.farmapp.farmsmartmanagement.config.security;

import com.farmapp.farmsmartmanagement.config.database.RlsContext;
import com.farmapp.farmsmartmanagement.infrastructure.security.JwtProvider;
import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            String token = resolveToken(request);

            if (token != null && jwtProvider.validate(token)) {
                UserPrincipal principal = jwtProvider.getPrincipal(token);

                var auth = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        principal.getAuthorities()
                );
                SecurityContextHolder.getContext().setAuthentication(auth);

                // ✅ Set RLS context nếu là farm token
                if (principal.getFarmId() != null) {
                    RlsContext.set(principal.getFarmId(), principal.getUserId());
                }
            }

            filterChain.doFilter(request, response);

        } finally {
            // ✅ LUÔN clear — tránh leak giữa các request trong cùng thread (HikariCP thread reuse)
            RlsContext.clear();
        }
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        return (bearer != null && bearer.startsWith("Bearer "))
                ? bearer.substring(7)
                : null;
    }
}