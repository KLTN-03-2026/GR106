package com.farmapp.farmsmartmanagement.infrastructure.service;

import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    public String buildVerifyEmail(String name, String verifyLink) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
                <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:20px 0;">
                    <tr>
                        <td align="center">
                            <table width="500" cellpadding="0" cellspacing="0"
                                   style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

                                <tr>
                                    <td style="background:#4CAF50;padding:20px;text-align:center;color:#fff;">
                                        <h2>🌿 Farm Smart</h2>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:30px;color:#333;">
                                        <h3>Xin chào %s 👋</h3>

                                        <p>Vui lòng xác thực email để sử dụng hệ thống:</p>

                                        <div style="text-align:center;margin:30px 0;">
                                            <a href="%s"
                                               style="background:#4CAF50;color:#fff;padding:12px 24px;
                                                      text-decoration:none;border-radius:6px;font-weight:bold;">
                                                Xác thực tài khoản
                                            </a>
                                        </div>

                                        <p style="font-size:13px;color:#888;">
                                            Link sẽ hết hạn sau 15 phút.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="background:#f4f6f8;padding:15px;text-align:center;font-size:12px;color:#888;">
                                        © 2026 Farm Smart
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(name, verifyLink);
    }
}