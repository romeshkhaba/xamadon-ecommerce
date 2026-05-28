import { roleModuleResponse } from './role-module-response.dto.js';

function asPlainRecord(model) {
  if (model && typeof model.get === 'function') {
    return model.get({ plain: true });
  }

  return model;
}

export function roleResponse(roleModel) {
  const role = asPlainRecord(roleModel);

  if (!role) {
    return null;
  }

  return {
    id: role.id,
    name: role.name,
    roleModules: Array.isArray(role.roleModules)
      ? role.roleModules.map(roleModuleResponse)
      : [],
    isActive: role.isActive !== false,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}
