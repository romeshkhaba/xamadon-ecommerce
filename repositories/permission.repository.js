import Permission from '../models/permission.model.js';

export async function getPermissions({ isActive } = {}) {
  const where = {};

  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  return Permission.findAll({
    where,
    order: [['createdAt', 'DESC']],
  });
}

export async function getPermissionById(id) {
  return Permission.findByPk(id);
}

export async function getPermissionByName(name) {
  return Permission.findOne({
    where: { name },
  });
}

export async function createPermission(data) {
  return Permission.create(data);
}

export async function updatePermission(id, data) {
  const permission = await Permission.findByPk(id);

  if (!permission) {
    return null;
  }

  await permission.update(data);

  return permission;
}

export async function deletePermission(id) {
  const permission = await Permission.findByPk(id);

  if (!permission) {
    return null;
  }

  await permission.update({ isActive: false });

  return permission;
}
