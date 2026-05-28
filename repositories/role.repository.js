import Role from '../models/role.model.js';
import RoleModule from '../models/role-module.model.js';
import Permission from '../models/permission.model.js';

const roleModulesInclude = {
  model: RoleModule,
  as: 'roleModules',
  include: [
    {
      model: Permission,
      as: 'permission',
    },
  ],
};

export async function getRoles() {
  return Role.findAll({
    include: [roleModulesInclude],
    order: [['createdAt', 'DESC']],
  });
}

export async function getRoleById(id) {
  return Role.findByPk(id, {
    include: [roleModulesInclude],
  });
}

export async function createRole(data) {
  return Role.create(data);
}

export async function updateRole(id, data) {
  const role = await Role.findByPk(id);

  if (!role) {
    return null;
  }

  await role.update(data);

  return getRoleById(id);
}

export async function deleteRole(id) {
  const role = await Role.findByPk(id);

  if (!role) {
    return null;
  }

  await role.update({ isActive: false });

  return getRoleById(id);
}
