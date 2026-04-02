package com.farmapp.farmsmartmanagement.common.exception;


import lombok.Getter;

@Getter
public enum ApiMessage {
    ALL_PERSON_IN_THE_TREE("Tất cả thành viên trong gia phả"),
    UPDATE_PERSON_SUCCESS("Cập nhật thông tin thành công"),
    UPDATE_BIRTH_INFO_SUCCESS("Cập nhật thông tin khai sinh thành công"),
    YOUR_ALL_TREE("Lấy tất cả cây của bạn thành công"),
    THE_TREE_YOU_NEED_TO_FIND("Tìm thấy cây của bạn"),
    CREATE_TREE_SUCCESS("Tạo mới cây thành công"),
    UPDATE_TREE_SUCCESS("Cập nhật cây thành công"),
    DELETE_TREE_SUCCESS("Xoá cây thành công"),
    GET_FAMILY_TREE_SUCCESS("Lấy cây phả hệ thành công"),
    CREATE_ROOT_SUCCESS("Tạo root thành công"),
    ADD_CHILD_SUCCESS("Thêm con thành công"),
    ADD_PARENT_SUCCESS("Thêm bố mẹ thành công"),
    ADD_SPOUSE_SUCCESS("Thêm hôn nhân thành công"),
    DELETE_PERSON_SUCCESS("Xóa người thành công"),
    DELETE_PERSON_RELATION_FIRST("Vui lòng xóa các mối quan hệ liên quan trước"),
    REGISTER_SUCCESS("Đăng ký tài khoản thành công"),
    LOGIN_SUCCESS("Đăng nhập thành công"),

    YOUR_ALL_ALBUM("Tất cả Album của bạn"),
    THE_ALBUM_YOU_NEED_TO_FIND("Album bạn cần tìm"),
    CREATE_ALBUM_SUCCESS("Tạo Album thành công"),
    UPDATE_ALBUM_SUCCESS("Cập nhật Album thành công"),
    DELETE_ALBUM_SUCCESS("Xoá Album thành công"),

    CREATE_IMAGE_SUCCESS("Thêm ảnh thành công"),
    YOUR_ALL_IMAGE("Tất cả ảnh trong Album của bạn"),
    THE_IMAGE_YOU_NEED_TO_FIND("Ảnh bạn cần tìm"),
    DELETE_IMAGE_SUCCESS("Xoá ảnh thành công"),

    UPLOAD_AVATAR_SUCCESS("Cập nhật avatar thành công"),


    UPDATE_DEATH_INFO_SUCCESS("Cập nhật thông tin người mất thành công")
    ;

    private final String message;

    ApiMessage(String message) {
        this.message = message;
    }
}

