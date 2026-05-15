package com.farmapp.farmsmartmanagement.config.rabbitmq;


import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ── Constants ─────────────────────────────────────────────────────────────

    // Exchange — topic cho phép routing linh hoạt theo pattern
    public static final String FARM_EXCHANGE = "farm.exchange";

    // Queues
    public static final String NOTIFICATION_QUEUE     = "farm.notification.queue";
    public static final String NOTIFICATION_DLQ       = "farm.notification.dlq";       // Dead Letter Queue

    // Routing Keys
    public static final String TASK_ASSIGNED_KEY      = "task.assigned";
    public static final String TASK_CREATED_KEY       = "task.created";
    public static final String TASK_UPDATED_KEY       = "task.updated";
    public static final String TASK_OVERDUE_KEY       = "task.overdue";

    // ── Exchange ──────────────────────────────────────────────────────────────

    @Bean
    public TopicExchange farmExchange() {
        return ExchangeBuilder
                .topicExchange(FARM_EXCHANGE)
                .durable(true)
                .build();
    }

    // ── Dead Letter Exchange + Queue ──────────────────────────────────────────

    @Bean
    public DirectExchange deadLetterExchange() {
        return ExchangeBuilder
                .directExchange("farm.dlx")
                .durable(true)
                .build();
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder
                .durable(NOTIFICATION_DLQ)
                .build();
    }

    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder
                .bind(deadLetterQueue())
                .to(deadLetterExchange())
                .with(NOTIFICATION_QUEUE);
    }

    // ── Notification Queue ────────────────────────────────────────────────────

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder
                .durable(NOTIFICATION_QUEUE)
                .withArgument("x-dead-letter-exchange", "farm.dlx")
                .withArgument("x-dead-letter-routing-key", NOTIFICATION_QUEUE)
                .withArgument("x-message-ttl", 86_400_000)  // 24h TTL
                .build();
    }

    // Binding: nhận tất cả event "task.*"
    @Bean
    public Binding notificationBinding() {
        return BindingBuilder
                .bind(notificationQueue())
                .to(farmExchange())
                .with("task.*");
    }

    // ── Serialization ─────────────────────────────────────────────────────────

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory cf) {
        RabbitTemplate template = new RabbitTemplate(cf);
        template.setMessageConverter(messageConverter());
        return template;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory cf) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(cf);
        factory.setMessageConverter(messageConverter());
        factory.setAcknowledgeMode(AcknowledgeMode.MANUAL);
        return factory;
    }
}