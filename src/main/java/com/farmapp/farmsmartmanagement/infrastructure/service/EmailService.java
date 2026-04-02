package com.farmapp.farmsmartmanagement.infrastructure.service;


public interface EmailService {

    void send(String to, String subject, String content);
    void sendHtml(String to, String subject, String html);
}