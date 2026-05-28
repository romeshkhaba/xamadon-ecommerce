import RoleModule from '../models/role-module.model.js';
import Permission from '../models/permission.model.js';

const permissionInclude = {
  model: Permission,
  as: 'permission',
};

export async function getRoleModules({ isActive, roleId } = {}) {
  const where = {};

  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  if (roleId !== undefined) {
    where.roleId = roleId;
  }

  return RoleModule.findAll({
    include: [permissionInclude],
    where,
    order: [['createdAt', 'DESC']],
  });
}

export async function getRoleModuleById(id) {
  return RoleModule.findByPk(id, {
    include: [permissionInclude],
  });
}

export async function getRoleModuleByRoleAndName(roleId, name) {
  return RoleModule.findOne({
    where: {
      roleId,
      name,
    },
  });
}

export async function getRoleModuleByRoleAndPermission(roleId, permissionId) {
  return RoleModule.findOne({
    where: {
      roleId,
      permissionId,
    },
  });
}

export async function createRoleModule(data) {
  return RoleModule.create(data);
}

export async function updateRoleModulesByPermissionId(permissionId, data) {
  return RoleModule.update(data, {
    where: { permissionId },
  });
}

export async function updateRoleModule(id, data) {
  const roleModule = await RoleModule.findByPk(id);

  if (!roleModule) {
    return null;
  }

  await roleModule.update(data);

  return getRoleModuleById(id);
}

export async function deleteRoleModule(id) {
  const roleModule = await RoleModule.findByPk(id);

  if (!roleModule) {
    return null;
  }

  await roleModule.update({ isActive: false });

  return getRoleModuleById(id);
}
