package com.farmapp.farmsmartmanagement.infrastructure.service;

import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    public String buildVerifyEmail(String name, String verifyLink) {
        return """
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác thực tài khoản</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">

<table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:30px 0;">
<tr>
<td align="center">

<!-- Container -->
<table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
        <td style="background:linear-gradient(135deg,#4CAF50,#2E7D32);padding:28px;text-align:center;color:#ffffff;">
            <h1 style="margin:0;font-size:22px;">🌿 Farm Smart</h1>
            <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Smart Agriculture Management Platform</p>
        </td>
    </tr>

    <!-- Body -->
    <tr>
        <td style="padding:36px 32px;color:#333333;line-height:1.6;">

            <h2 style="margin-top:0;font-size:20px;">
                Xin chào %s 👋
            </h2>

            <p style="font-size:15px;color:#555;">
                Cảm ơn bạn đã đăng ký tài khoản tại <b>Farm Smart</b>.
                Để bắt đầu sử dụng hệ thống quản lý nông trại thông minh,
                vui lòng xác thực email của bạn.
            </p>

            <!-- CTA Button -->
            <div style="text-align:center;margin:32px 0;">
                <a href="%s"
                   style="display:inline-block;
                          background:linear-gradient(135deg,#4CAF50,#43A047);
                          color:#ffffff;
                          padding:14px 28px;
                          font-size:15px;
                          font-weight:600;
                          text-decoration:none;
                          border-radius:8px;
                          box-shadow:0 4px 12px rgba(76,175,80,0.3);">
                    ✅ Xác thực tài khoản
                </a>
            </div>

            <!-- Fallback -->
            <p style="font-size:13px;color:#888;">
                Nếu nút không hoạt động, bạn có thể copy link bên dưới:
            </p>

            <p style="word-break:break-all;font-size:12px;color:#4CAF50;">
                %s
            </p>

            <!-- Warning -->
            <div style="margin-top:24px;padding:14px;background:#fff8e1;border-radius:8px;">
                <p style="margin:0;font-size:13px;color:#8d6e63;">
                    ⏳ Link xác thực sẽ hết hạn sau <b>15 phút</b>.
                </p>
            </div>

        </td>
    </tr>

    <!-- Divider -->
    <tr>
        <td style="padding:0 32px;">
            <hr style="border:none;border-top:1px solid #eee;">
        </td>
    </tr>

    <!-- Footer -->
    <tr>
        <td style="padding:20px 32px;text-align:center;font-size:12px;color:#999;">

            <p style="margin:0;">
                Nếu bạn không tạo tài khoản, hãy bỏ qua email này.
            </p>

            <p style="margin:10px 0 0;">
                © 2026 Farm Smart • All rights reserved
            </p>

        </td>
    </tr>

</table>

<!-- Bottom spacing -->
<table width="520" cellpadding="0" cellspacing="0">
<tr><td height="20"></td></tr>
</table>

</td>
</tr>
</table>

</body>
</html>
""".formatted(name, verifyLink, verifyLink);
    }

    // EmailTemplateService.java — thêm method
    public String buildCredentialsEmail(String fullName, String email,
                                        String rawPassword, String farmName, String loginLink) {
        return """
        <div style="font-family:sans-serif;max-width:600px;margin:auto">
            <h2>Xin chào %s,</h2>
            <p>Bạn được mời tham gia farm <strong>%s</strong> trên FarmSmart.</p>
            <p>Thông tin đăng nhập của bạn:</p>
            <table style="border-collapse:collapse;width:100%%">
                <tr>
                    <td style="padding:8px;border:1px solid #ddd">Email</td>
                    <td style="padding:8px;border:1px solid #ddd"><strong>%s</strong></td>
                </tr>
                <tr>
                    <td style="padding:8px;border:1px solid #ddd">Mật khẩu tạm</td>
                    <td style="padding:8px;border:1px solid #ddd"><strong>%s</strong></td>
                </tr>
            </table>
            <p style="color:#e74c3c">
                Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu.
            </p>
            <a href="%s" style="display:inline-block;padding:12px 24px;
                background:#27ae60;color:#fff;text-decoration:none;border-radius:4px">
                Đăng nhập ngay
            </a>
        </div>
        """.formatted(fullName, farmName, email, rawPassword, loginLink);
    }

    public String buildFarmInvitationEmail(String fullName, String farmName, String farmLink) {
        return """
        <div style="font-family:sans-serif;max-width:600px;margin:auto">
            <h2>Xin chào %s,</h2>
            <p>Bạn được mời tham gia farm <strong>%s</strong> trên FarmSmart.</p>
            <p>Nhấn vào nút bên dưới để xem farm của bạn:</p>
            <a href="%s" style="display:inline-block;padding:12px 24px;
                background:#27ae60;color:#fff;text-decoration:none;border-radius:4px">
                Vào farm ngay
            </a>
            <p style="color:#999;font-size:12px;margin-top:24px">
                Nếu bạn không muốn tham gia, có thể bỏ qua email này.
            </p>
        </div>
        """.formatted(fullName, farmName, farmLink);
    }
}