package habsida.spring.boot_security.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class AdminViewController {

    @GetMapping("/admin/users")
    public String adminPage() {
        return "admin/list";
    }
}
