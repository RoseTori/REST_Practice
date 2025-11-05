package habsida.spring.boot_security.demo.mappers;

import habsida.spring.boot_security.demo.domain.UserDTO;
import habsida.spring.boot_security.demo.models.User;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class UserMapper implements Mapper<User, UserDTO> {

    private ModelMapper modelMapper;

    public UserMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    @Override
    public UserDTO mapTo(User user) {
        UserDTO userDto = modelMapper.map(user, UserDTO.class);
        userDto.setPassword(null);
        return userDto;
    }

    @Override
    public User mapFrom(UserDTO userDto) {
        return modelMapper.map(userDto, User.class);
    }

    public void updateUserFromDto(UserDTO userDto, User user) {

        if (userDto.getFirstName() != null) {
            user.setFirstName(userDto.getFirstName());
        }
        if (userDto.getLastName() != null) {
            user.setLastName(userDto.getLastName());
        }
        if (userDto.getUsername() != null) {
            user.setUsername(userDto.getUsername());
        }
    }
}
