package habsida.spring.boot_security.demo.configs;

import habsida.spring.boot_security.demo.service.CustomDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
    private final SuccessUserHandler successUserHandler;
    private final CustomDetailsService customDetailsService;

    public WebSecurityConfig(SuccessUserHandler successUserHandler, CustomDetailsService customDetailsService) {
        this.customDetailsService = customDetailsService;
        this.successUserHandler = successUserHandler;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf
                        .ignoringAntMatchers("/api/**", "/login")
                )
                .authorizeRequests(authz -> authz
                        .antMatchers("/", "/index").permitAll()
                        .antMatchers("/api/admin/**").hasRole("ADMIN")
                        .antMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
                        .antMatchers("/admin/**").hasRole("ADMIN")
                        .antMatchers("/user/**").hasAnyRole("USER", "ADMIN")
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .successHandler(successUserHandler)
                        .permitAll()
                )
                .logout(logout -> logout
                        .permitAll()
                );
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(customDetailsService).passwordEncoder(passwordEncoder());
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}