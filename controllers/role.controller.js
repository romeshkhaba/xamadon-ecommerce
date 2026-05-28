import * as roleService from '../services/role.service.js';

export async function getRoles(req, res) {
  const roles = await roleService.getRoles();

  res.success(roles, 'Roles retrieved successfully');
}

export async function getRoleById(req, res) {
  const role = await roleService.getRoleById(req.params.id);

  res.success(role, 'Role retrieved successfully');
}

export async function createRole(req, res) {
  const role = await roleService.createRole(req.validatedData);

  res.success(role, 'Role created successfully', 201);
}

export async function updateRole(req, res) {
  const role = await roleService.updateRole(req.params.id, req.validatedData);

  res.success(role, 'Role updated successfully');
}

export async function deleteRole(req, res) {
  const role = await roleService.deleteRole(req.params.id);

  res.success(role, 'Role deleted successfully');
}
