import { hasRoleModuleAccess } from '../models/role-module.model.js';

function getAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminUser(user) {
  const email = user?.email?.trim().toLowerCase();

  return Boolean(user?.isAdmin) || (email ? getAdminEmails().has(email) : false);
}

export function getUserRole(user) {
  if (!user) {
    return null;
  }

  if (user.role) {
    return user.role;
  }

  if (typeof user.get === 'function') {
    return user.get('role') ?? null;
  }

  return null;
}

export function getUserRoleModules(user) {
  const role = getUserRole(user);

  if (!role || role.isActive === false || !Array.isArray(role.roleModules)) {
    return [];
  }

  return role.roleModules;
}

export function hasAdminAccess(user) {
  return isAdminUser(user) || hasModulePermission(user, 'dashboard', 'read');
}

export function hasModulePermission(user, moduleName, action) {
  return (
    isAdminUser(user) ||
    getUserRoleModules(user).some(
      (roleModule) =>
        (roleModule.name === moduleName ||
          roleModule.permission?.name === moduleName) &&
        hasRoleModuleAccess(roleModule, action)
    )
  );
}
