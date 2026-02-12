package com.cura;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class CuraApiApplication {
    @Bean
    ApplicationRunner showDatasourceProps(Environment env) {
        return args -> {
            System.out.println("spring.datasource.url=" + env.getProperty("spring.datasource.url"));
            System.out.println("spring.datasource.username=" + env.getProperty("spring.datasource.username"));
            System.out.println("spring.datasource.password set? " + (env.getProperty("spring.datasource.password") != null));
        };
    }

    public static void main(String[] args) {
        SpringApplication.run(CuraApiApplication.class, args);
    }




}
