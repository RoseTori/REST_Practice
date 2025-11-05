package habsida.spring.boot_security.demo.controller;

import habsida.spring.boot_security.demo.domain.RoleDTO;
import habsida.spring.boot_security.demo.domain.UserDTO;
import habsida.spring.boot_security.demo.mappers.UserMapper;
import habsida.spring.boot_security.demo.models.Role;
import habsida.spring.boot_security.demo.models.User;
import habsida.spring.boot_security.demo.service.RoleService;
import habsida.spring.boot_security.demo.service.UserServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RequestMapping("/api/admin")
@RestController
public class AdminController {
    private final UserServiceImpl userService;
    private final PasswordEncoder passwordEncoder;
    private final RoleService roleService;
    private final UserMapper userMapper;
    private final ModelMapper modelMapper;

    public AdminController(UserServiceImpl userService, PasswordEncoder passwordEncoder, RoleService roleService, UserMapper userMapper, ModelMapper modelMapper) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.roleService = roleService;
        this.userMapper = userMapper;
        this.modelMapper = modelMapper;
    }


    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userService.findAll();
        List<UserDTO> userDtos = users.stream()
                .map(userMapper::mapTo)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);

    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            UserDTO userDTO = userMapper.mapTo(user);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found: " + id);
        }
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@Valid @RequestBody UserDTO userDTO) {
        try {
            User user = userMapper.mapFrom(userDTO);
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));

            User savedUser = userService.saveUser(user);
            UserDTO savedUserDTO = userMapper.mapTo(savedUser);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedUserDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid username or password");
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UserDTO userDTO) {

        try {
            User existingUser = userService.getUserById(id);
            userMapper.updateUserFromDto(userDTO, existingUser);

            if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            }

            userService.updateUser(existingUser);
            UserDTO responseDTO = userMapper.mapTo(existingUser);

            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return  ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid username or password");
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().body("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid username or password");
        }
    }

    @GetMapping("/roles")
    public ResponseEntity<List<RoleDTO>> getAllRoles() {
        List<Role> roles = roleService.findAll();
        List<RoleDTO> roleDTOS = roles.stream()
                .map(role -> modelMapper.map(role, RoleDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(roleDTOS);
    }
}
