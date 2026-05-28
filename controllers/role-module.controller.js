import * as roleModuleService from '../services/role-module.service.js';

export async function getRoleModules(req, res) {
  const roleModules = await roleModuleService.getRoleModules(req.query);

  res.success(roleModules, 'Role modules retrieved successfully');
}

export async function getRoleModuleById(req, res) {
  const roleModule = await roleModuleService.getRoleModuleById(req.params.id);

  res.success(roleModule, 'Role module retrieved successfully');
}

export async function createRoleModule(req, res) {
  const roleModule = await roleModuleService.createRoleModule(req.validatedData);

  res.success(roleModule, 'Role module created successfully', 201);
}

export async function updateRoleModule(req, res) {
  const roleModule = await roleModuleService.updateRoleModule(
    req.params.id,
    req.validatedData
  );

  res.success(roleModule, 'Role module updated successfully');
}

export async function deleteRoleModule(req, res) {
  const roleModule = await roleModuleService.deleteRoleModule(req.params.id);

  res.success(roleModule, 'Role module deleted successfully');
}
