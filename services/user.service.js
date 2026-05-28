import { AppError } from '../middleware/error-response.js';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { UniqueConstraintError } from 'sequelize';
import * as roleRepository from '../repositories/role.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import { sendAdminCreatedUserEmail } from './email.service.js';

const SALT_ROUNDS = 10;

function generatePassword() {
  return crypto
    .randomBytes(12)
    .toString('base64url')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 12);
}

function getClientLoginUrl() {
  const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${clientUrl.replace(/\/$/, '')}/auth/login`;
}

export async function getUserById(id) {
  return userRepository.getUserById(id);
}

export async function getAllUsers(){
    return userRepository.getAllUsers();
}

export async function createUserByAdmin(data) {
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();
  const existingUser = await userRepository.getUserByEmail(email);

  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  if (data.roleId) {
    const role = await roleRepository.getRoleById(data.roleId);

    if (!role) {
      throw new AppError('Role does not exist', 404);
    }

    if (role.isActive === false) {
      throw new AppError('Role is inactive', 400);
    }
  }

  const plainPassword = data.password || generatePassword();
  const shouldEmailPassword = !data.password;

  try {
    const user = await userRepository.createUser({
      name,
      email,
      password: await bcrypt.hash(plainPassword, SALT_ROUNDS),
      roleId: data.roleId || null,
      isAdmin: Boolean(data.isAdmin),
    });

    if (shouldEmailPassword) {
      try {
        await sendAdminCreatedUserEmail(user, plainPassword, getClientLoginUrl());
      } catch (error) {
        console.error('Failed to send created user email:', error.message);
      }
    }

    return userRepository.getUserById(user.id);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError('Email already exists', 409);
    }
    throw error;
  }
}

export async function updateUserProfile(id, data){
  const user = await userRepository.updateUserProfile(id, data);
  if (!user){
    throw new AppError("User does not exist", 404);
  }
  return user;
}

export async function updateAdminUser(id, data) {
  const existing = await userRepository.getUserById(id);

  if (!existing) {
    throw new AppError('User not found', 404);
  }

  if (data.email) {
    const email = data.email.trim().toLowerCase();
    const conflict = await userRepository.getUserByEmail(email);
    if (conflict && conflict.id !== id) {
      throw new AppError('Email already in use', 409);
    }
    data.email = email;
  }

  if (data.roleId) {
    const role = await roleRepository.getRoleById(data.roleId);
    if (!role) throw new AppError('Role does not exist', 404);
    if (role.isActive === false) throw new AppError('Role is inactive', 400);
  }

  const updates = { ...data };

  if (data.password) {
    updates.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  await userRepository.updateUserById(id, updates);

  return userRepository.getUserById(id);
}

export async function deleteAdminUser(id) {
  const deleted = await userRepository.deleteUserById(id);

  if (!deleted) {
    throw new AppError('User not found', 404);
  }
}

export async function assignUserRole(id, roleId){
  if (roleId) {
    const role = await roleRepository.getRoleById(roleId);

    if (!role) {
      throw new AppError("Role does not exist", 404);
    }

    if (role.isActive === false) {
      throw new AppError("Role is inactive", 400);
    }
  }

  const user = await userRepository.assignUserRole(id, roleId);

  if (!user){
    throw new AppError("User does not exist", 404);
  }

  return user;
}
