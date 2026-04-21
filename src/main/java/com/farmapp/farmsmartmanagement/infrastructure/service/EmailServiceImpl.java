package com.farmapp.farmsmartmanagement.infrastructure.service;

import com.farmapp.farmsmartmanagement.config.app.MailProperties;
import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final MailProperties mailProperties;

    @Override
    public void send(String to, String subject, String content) {
        sendHtml(to, subject, "<p>" + content + "</p>");
    }

    @Override
    public void sendHtml(String to, String subject, String html) {
        try {
            Email from    = new Email(mailProperties.getFromEmail(), mailProperties.getFromName());
            Email toEmail = new Email(to);
            Content content = new Content("text/html", html);
            Mail mail = new Mail(from, subject, toEmail, content);

            SendGrid sg = new SendGrid(mailProperties.getApiKey());
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);
            log.info("SendGrid status: {}", response.getStatusCode());

            if (response.getStatusCode() >= 400) {
                log.error("SendGrid error body: {}", response.getBody());
                throw new RuntimeException("SendGrid failed with status: " + response.getStatusCode());
            }

            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("sendHtml FAILED: {}", e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }
}