import { UniqueConstraintError } from 'sequelize';
import { roleModuleResponse } from '../dto/role-module-response.dto.js';
import { AppError } from '../middleware/error-response.js';
import * as permissionRepository from '../repositories/permission.repository.js';
import * as roleRepository from '../repositories/role.repository.js';
import * as roleModuleRepository from '../repositories/role-module.repository.js';

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

function normalizeRoleModulePayload(data) {
  const payload = { ...data };

  if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
    payload.name = payload.name.trim();
  }

  return payload;
}

async function ensureRoleModuleIsUnique({ roleId = null, name }, ignoreId) {
  if (!name) {
    return;
  }

  const existingRoleModule = await roleModuleRepository.getRoleModuleByRoleAndName(
    roleId,
    name
  );

  if (existingRoleModule && existingRoleModule.id !== ignoreId) {
    throw new AppError('Role module already exists for this role', 409);
  }
}

async function normalizeRoleModuleWithPermission(data) {
  const payload = normalizeRoleModulePayload(data);

  if (!payload.permissionId) {
    return payload;
  }

  const permission = await permissionRepository.getPermissionById(payload.permissionId);

  if (!permission) {
    throw new AppError('Permission not found', 404);
  }

  payload.name = permission.name;

  for (const action of ['read', 'write', 'delete']) {
    if (!Object.prototype.hasOwnProperty.call(payload, action)) {
      payload[action] = permission[action];
    }
  }

  return payload;
}

export async function getRoleModules(query = {}) {
  const isActive =
    query.isActive === undefined ? undefined : parseBoolean(query.isActive, undefined);
  const roleId =
    typeof query.roleId === 'string' && query.roleId.trim()
      ? query.roleId.trim()
      : undefined;
  const roleModules = await roleModuleRepository.getRoleModules({ isActive, roleId });

  return roleModules.map(roleModuleResponse);
}

export async function getRoleModuleById(id) {
  const roleModule = await roleModuleRepository.getRoleModuleById(id);

  if (!roleModule) {
    throw new AppError('Role module not found', 404);
  }

  return roleModuleResponse(roleModule);
}

export async function createRoleModule(data) {
  if (data.roleId) {
    const role = await roleRepository.getRoleById(data.roleId);

    if (!role) {
      throw new AppError('Role not found', 404);
    }
  }

  try {
    const payload = await normalizeRoleModuleWithPermission(data);

    if (payload.permissionId) {
      const existingRoleModule =
        await roleModuleRepository.getRoleModuleByRoleAndPermission(
          payload.roleId ?? null,
          payload.permissionId
        );

      if (existingRoleModule) {
        throw new AppError('Role module already exists for this role', 409);
      }
    }

    await ensureRoleModuleIsUnique({
      roleId: payload.roleId ?? null,
      name: payload.name,
    });

    const roleModule = await roleModuleRepository.createRoleModule(payload);

    return roleModuleResponse(roleModule);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError('Role module name already exists', 409);
    }

    throw error;
  }
}

export async function updateRoleModule(id, data) {
  const existingRoleModule = await roleModuleRepository.getRoleModuleById(id);

  if (!existingRoleModule) {
    throw new AppError('Role module not found', 404);
  }

  if (data.roleId) {
    const role = await roleRepository.getRoleById(data.roleId);

    if (!role) {
      throw new AppError('Role not found', 404);
    }
  }

  try {
    const payload = await normalizeRoleModuleWithPermission(data);
    const nextRoleId = Object.prototype.hasOwnProperty.call(payload, 'roleId')
      ? payload.roleId
      : existingRoleModule.roleId;
    const nextName = Object.prototype.hasOwnProperty.call(payload, 'name')
      ? payload.name
      : existingRoleModule.name;

    await ensureRoleModuleIsUnique(
      {
        roleId: nextRoleId ?? null,
        name: nextName,
      },
      existingRoleModule.id
    );

    const nextPermissionId = Object.prototype.hasOwnProperty.call(payload, 'permissionId')
      ? payload.permissionId
      : existingRoleModule.permissionId;

    if (nextPermissionId) {
      const existingRoleModuleForPermission =
        await roleModuleRepository.getRoleModuleByRoleAndPermission(
          nextRoleId ?? null,
          nextPermissionId
        );

      if (
        existingRoleModuleForPermission &&
        existingRoleModuleForPermission.id !== existingRoleModule.id
      ) {
        throw new AppError('Role module already exists for this role', 409);
      }
    }

    const roleModule = await roleModuleRepository.updateRoleModule(
      id,
      payload
    );

    return roleModuleResponse(roleModule);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError('Role module name already exists', 409);
    }

    throw error;
  }
}

export async function deleteRoleModule(id) {
  const roleModule = await roleModuleRepository.deleteRoleModule(id);

  if (!roleModule) {
    throw new AppError('Role module not found', 404);
  }

  return roleModuleResponse(roleModule);
}
