package com.farmapp.farmsmartmanagement.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.farmapp.farmsmartmanagement.common.response.ApiResponse;
import com.farmapp.farmsmartmanagement.config.database.RlsContext;
import com.farmapp.farmsmartmanagement.infrastructure.security.JwtProvider;
import com.farmapp.farmsmartmanagement.infrastructure.security.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final ObjectMapper objectMapper; // Spring tự inject bean ObjectMapper

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            String token = resolveToken(request);

            if (token != null) {
                // Validate token — có thể throw nếu token malformed
                if (jwtProvider.validate(token)) {
                    UserPrincipal principal = jwtProvider.getPrincipal(token);

                    var auth = new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            principal.getAuthorities()
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);

                    if (principal != null) {
                        RlsContext.set(principal.getFarmId(), principal.getUserId());
                    }
                } else {
                    // Token không hợp lệ hoặc hết hạn
                    writeErrorResponse(response, HttpStatus.UNAUTHORIZED, 401, "Token không hợp lệ hoặc đã hết hạn");
                    return; // Dừng filter chain
                }
            }

            filterChain.doFilter(request, response);

        } catch (io.jsonwebtoken.ExpiredJwtException ex) {
            log.warn("JWT expired: {}", ex.getMessage());
            writeErrorResponse(response, HttpStatus.UNAUTHORIZED, 401, "Token đã hết hạn");

        } catch (io.jsonwebtoken.MalformedJwtException | io.jsonwebtoken.security.SignatureException ex) {
            log.warn("JWT malformed/invalid signature: {}", ex.getMessage());
            writeErrorResponse(response, HttpStatus.UNAUTHORIZED, 401, "Token không hợp lệ");

        } catch (io.jsonwebtoken.UnsupportedJwtException ex) {
            log.warn("JWT unsupported: {}", ex.getMessage());
            writeErrorResponse(response, HttpStatus.UNAUTHORIZED, 401, "Token không được hỗ trợ");

        } catch (Exception ex) {
            // Fallback — lỗi không mong đợi trong filter
            log.error("Unexpected error in JwtAuthenticationFilter: ", ex);
            writeErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, 500, "Lỗi hệ thống, vui lòng thử lại sau");

        } finally {
            RlsContext.clear();
            SecurityContextHolder.clearContext();
        }
    }

    private void writeErrorResponse(
            HttpServletResponse response,
            HttpStatus httpStatus,
            int code,
            String message
    ) throws IOException {
        response.setStatus(httpStatus.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ApiResponse<Void> body = ApiResponse.error(code, message);
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        return (bearer != null && bearer.startsWith("Bearer "))
                ? bearer.substring(7)
                : null;
    }
}