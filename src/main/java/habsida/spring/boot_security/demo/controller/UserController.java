package habsida.spring.boot_security.demo.controller;

import habsida.spring.boot_security.demo.domain.UserDTO;
import habsida.spring.boot_security.demo.mappers.UserMapper;
import habsida.spring.boot_security.demo.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RequestMapping("/api/user")
@RestController
public class    UserController {

    private final UserMapper userMapper;

    @Autowired
    public UserController(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @GetMapping("/info")
    public ResponseEntity<UserDTO> getCurrentUserInfo (Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        UserDTO userDTO = userMapper.mapTo(currentUser);
        return ResponseEntity.ok(userDTO);
    }
}
