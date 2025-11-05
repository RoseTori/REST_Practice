package habsida.spring.boot_security.demo.mappers;

import habsida.spring.boot_security.demo.domain.RoleDTO;
import habsida.spring.boot_security.demo.models.Role;
import org.modelmapper.ModelMapper;

public class RoleMapper implements Mapper<Role, RoleDTO> {

    private ModelMapper modelMapper;

    public RoleMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }


    @Override
    public RoleDTO mapTo(Role role) {
        return modelMapper.map(role, RoleDTO.class);
    }

    @Override
    public Role mapFrom(RoleDTO roleDTO) {
        return modelMapper.map(roleDTO, Role.class);
    }
}
