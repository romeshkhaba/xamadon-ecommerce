function asPlainRecord(model) {
  if (model && typeof model.get === 'function') {
    return model.get({ plain: true });
  }

  return model;
}

export function permissionResponse(permissionModel) {
  const permission = asPlainRecord(permissionModel);

  if (!permission) {
    return null;
  }

  return {
    id: permission.id,
    name: permission.name,
    read: permission.read === true,
    write: permission.write === true,
    delete: permission.delete === true,
    isActive: permission.isActive !== false,
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt,
  };
}
