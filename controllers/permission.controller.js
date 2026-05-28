import * as permissionService from '../services/permission.service.js';

export async function getPermissions(req, res) {
  const permissions = await permissionService.getPermissions(req.query);

  res.success(permissions, 'Permissions retrieved successfully');
}

export async function getPermissionById(req, res) {
  const permission = await permissionService.getPermissionById(req.params.id);

  res.success(permission, 'Permission retrieved successfully');
}

export async function createPermission(req, res) {
  const permission = await permissionService.createPermission(req.validatedData);

  res.success(permission, 'Permission created successfully', 201);
}

export async function updatePermission(req, res) {
  const permission = await permissionService.updatePermission(
    req.params.id,
    req.validatedData
  );

  res.success(permission, 'Permission updated successfully');
}

export async function deletePermission(req, res) {
  const permission = await permissionService.deletePermission(req.params.id);

  res.success(permission, 'Permission deleted successfully');
}
