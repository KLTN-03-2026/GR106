package com.farmapp.farmsmartmanagement.common.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageableResponse<T> {

    private List<T> content;
    private int pageNumber;      // trang hiện tại (0-based)
    private int pageSize;        // số phần tử mỗi trang
    private long totalElements;  // tổng số phần tử
    private int totalPages;      // tổng số trang
    private boolean first;       // có phải trang đầu không
    private boolean last;        // có phải trang cuối không
    private boolean empty;       // trang có rỗng không

    // ─────────────────────────────────────────────────────
    // Factory method — tạo từ Page<T> của Spring
    // ─────────────────────────────────────────────────────
    public static <T> PageableResponse<T> of(Page<T> page) {
        return PageableResponse.<T>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .empty(page.isEmpty())
                .build();
    }

    // ─────────────────────────────────────────────────────
    // Factory method — khi đã map content sang DTO khác
    // ─────────────────────────────────────────────────────
    public static <T, R> PageableResponse<R> of(Page<T> page, List<R> mappedContent) {
        return PageableResponse.<R>builder()
                .content(mappedContent)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .empty(page.isEmpty())
                .build();
    }
}