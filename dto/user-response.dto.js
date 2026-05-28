export function userResponse(user){
    const {id, name, email, isAdmin, roleId, role, createdAt, updatedAt} = user.get({plain:true});
    const roleModules = Array.isArray(role?.roleModules) ? role.roleModules : [];

    return {
        id,
        name,
        email,
        isAdmin,
        roleId,
        role: role
          ? {
              id: role.id,
              name: role.name,
              roleModules,
              isActive: role.isActive !== false,
            }
          : null,
        createdAt,
        updatedAt
    }
}
