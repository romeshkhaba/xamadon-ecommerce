import { UniqueConstraintError } from 'sequelize';
import { permissionResponse } from '../dto/permission-response.dto.js';
import { AppError } from '../middleware/error-response.js';
import * as permissionRepository from '../repositories/permission.repository.js';
import * as roleModuleRepository from '../repositories/role-module.repository.js';
import * as roleRepository from '../repositories/role.repository.js';

function parseBoolean(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalizedValue = String(value).trim().toLowerCase();

  if (normalizedValue === 'true') {
    return true;
  }

  if (normalizedValue === 'false') {
    return false;
  }

  return fallback;
}

function normalizePermissionPayload(data) {
  const payload = { ...data };

  if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
    payload.name = payload.name.trim();
  }

  return payload;
}

async function ensurePermissionNameIsUnique(name, ignoreId) {
  if (!name) {
    return;
  }

  const existingPermission = await permissionRepository.getPermissionByName(name);

  if (existingPermission && existingPermission.id !== ignoreId) {
    throw new AppError('Permission name already exists', 409);
  }
}

async function createRoleModulesForPermission(permission) {
  const roles = await roleRepository.getRoles();

  for (const role of roles) {
    if (role.isActive === false) {
      continue;
    }

    const existingRoleModule =
      await roleModuleRepository.getRoleModuleByRoleAndPermission(
        role.id,
        permission.id
      );

    if (existingRoleModule) {
      continue;
    }

    await roleModuleRepository.createRoleModule({
      roleId: role.id,
      permissionId: permission.id,
      name: permission.name,
      read: permission.read,
      write: permission.write,
      delete: permission.delete,
      isActive: permission.isActive,
    });
  }
}

export async function getPermissions(query = {}) {
  const isActive =
    query.isActive === undefined ? undefined : parseBoolean(query.isActive, undefined);
  const permissions = await permissionRepository.getPermissions({ isActive });

  return permissions.map(permissionResponse);
}

export async function getPermissionById(id) {
  const permission = await permissionRepository.getPermissionById(id);

  if (!permission) {
    throw new AppError('Permission not found', 404);
  }

  return permissionResponse(permission);
}

export async function createPermission(data) {
  try {
    const payload = normalizePermissionPayload(data);
    await ensurePermissionNameIsUnique(payload.name);

    const permission = await permissionRepository.createPermission(payload);
    await createRoleModulesForPermission(permission);

    return permissionResponse(permission);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError('Permission name already exists', 409);
    }

    throw error;
  }
}

export async function updatePermission(id, data) {
  try {
    const payload = normalizePermissionPayload(data);
    await ensurePermissionNameIsUnique(payload.name, id);

    const permission = await permissionRepository.updatePermission(id, payload);

    if (!permission) {
      throw new AppError('Permission not found', 404);
    }

    const roleModuleUpdates = {};

    if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
      roleModuleUpdates.name = permission.name;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'isActive')) {
      roleModuleUpdates.isActive = permission.isActive;
    }

    if (Object.keys(roleModuleUpdates).length > 0) {
      await roleModuleRepository.updateRoleModulesByPermissionId(
        permission.id,
        roleModuleUpdates
      );
    }

    return permissionResponse(permission);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError('Permission name already exists', 409);
    }

    throw error;
  }
}

export async function deletePermission(id) {
  const permission = await permissionRepository.deletePermission(id);

  if (!permission) {
    throw new AppError('Permission not found', 404);
  }

  await roleModuleRepository.updateRoleModulesByPermissionId(permission.id, {
    isActive: false,
  });

  return permissionResponse(permission);
}
