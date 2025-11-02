package habsida.spring.boot_security.demo.service;


import habsida.spring.boot_security.demo.models.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> findAll();
    User saveUser(User user);
    User getUserById(Long id);
    void updateUser(User user);
    void deleteUser(Long id);
    User findByUsername(String username);

}
