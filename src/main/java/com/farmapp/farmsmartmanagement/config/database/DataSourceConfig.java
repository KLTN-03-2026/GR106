package com.farmapp.farmsmartmanagement.config.database;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.flyway.FlywayConfigurationCustomizer;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean("rawDataSourceProperties")
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSourceProperties dataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean("hikariDataSource")
    public HikariDataSource hikariDataSource(
            @Qualifier("rawDataSourceProperties") DataSourceProperties props) {
        return props.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

//    @Primary
//    @Bean("dataSource")
//    public DataSource dataSource(
//            @Qualifier("hikariDataSource") HikariDataSource hikariDataSource) {
//        return new RlsDataSourceWrapper(hikariDataSource);
//    }

    @Primary
    @Bean("dataSource")
    public DataSource dataSource(
            @Qualifier("hikariDataSource") HikariDataSource hikariDataSource) {
        return hikariDataSource; // ❌ bỏ wrapper
    }

    // Flyway dùng raw connection, không qua RLS wrapper
    @Bean
    public FlywayConfigurationCustomizer flywayCustomizer(
            @Qualifier("hikariDataSource") HikariDataSource hikariDataSource) {
        return configuration -> configuration.dataSource(hikariDataSource);
    }
}