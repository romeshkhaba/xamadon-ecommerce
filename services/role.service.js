import { UniqueConstraintError } from 'sequelize';
import { roleResponse } from '../dto/role-response.dto.js';
import { AppError } from '../middleware/error-response.js';
import * as permissionRepository from '../repositories/permission.repository.js';
import * as roleModuleRepository from '../repositories/role-module.repository.js';
import * as roleRepository from '../repositories/role.repository.js';

function normalizeRolePayload(data) {
  const payload = { ...data };

  return payload;
}

export async function getRoles() {
  const roles = await roleRepository.getRoles();

  return roles.map(roleResponse);
}

export async function getRoleById(id) {
  const role = await roleRepository.getRoleById(id);

  if (!role) {
    throw new AppError('Role not found', 404);
  }

  return roleResponse(role);
}

export async function createRole(data) {
  try {
    const { permissionIds, ...roleData } = data;
    const payload = normalizeRolePayload(roleData);
    const role = await roleRepository.createRole(payload);
    const permissions = await permissionRepository.getPermissions({ isActive: true });

    for (const permission of permissions) {
      // If caller specified which permissions are accessible, only those are active.
      // If no list was sent, fall back to the permission's own isActive value.
      const isActive = permissionIds !== undefined
        ? permissionIds.includes(permission.id)
        : permission.isActive;

      await roleModuleRepository.createRoleModule({
        roleId: role.id,
        permissionId: permission.id,
        name: permission.name,
        read: permission.read,
        write: permission.write,
        delete: permission.delete,
        isActive,
      });
    }

    return roleResponse(await roleRepository.getRoleById(role.id));
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError('Role name already exists', 409);
    }

    throw error;
  }
}

export async function updateRole(id, data) {
  try {
    const payload = normalizeRolePayload(data);
    const role = await roleRepository.updateRole(id, payload);

    if (!role) {
      throw new AppError('Role not found', 404);
    }

    return roleResponse(role);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError('Role name already exists', 409);
    }

    throw error;
  }
}

export async function deleteRole(id) {
  const role = await roleRepository.deleteRole(id);

  if (!role) {
    throw new AppError('Role not found', 404);
  }

  return roleResponse(role);
}
