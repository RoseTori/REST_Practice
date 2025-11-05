package habsida.spring.boot_security.demo.domain;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.Set;

@Data
public class UserDTO {
    private Long id;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Username is required")
    @Size(min = 3, message = "Username must be at least 3 characters long")
    private String username;

    @Size(min = 3, message = "Password must be at least 3 characters long")
    private String password;

    private Set<RoleDTO> roles;
}
