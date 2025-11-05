package habsida.spring.boot_security.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UserViewController {

    @GetMapping("/user/info")
    public String userPage() {
        return "user/info";
    }
}
