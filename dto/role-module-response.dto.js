function asPlainRecord(model) {
  if (model && typeof model.get === 'function') {
    return model.get({ plain: true });
  }

  return model;
}

export function roleModuleResponse(roleModuleModel) {
  const roleModule = asPlainRecord(roleModuleModel);

  if (!roleModule) {
    return null;
  }

  return {
    id: roleModule.id,
    roleId: roleModule.roleId,
    permissionId: roleModule.permissionId,
    name: roleModule.name,
    permission: roleModule.permission
      ? {
          id: roleModule.permission.id,
          name: roleModule.permission.name,
          read: roleModule.permission.read === true,
          write: roleModule.permission.write === true,
          delete: roleModule.permission.delete === true,
          isActive: roleModule.permission.isActive !== false,
        }
      : null,
    read: roleModule.read === true,
    write: roleModule.write === true,
    delete: roleModule.delete === true,
    isActive: roleModule.isActive !== false,
    createdAt: roleModule.createdAt,
    updatedAt: roleModule.updatedAt,
  };
}
