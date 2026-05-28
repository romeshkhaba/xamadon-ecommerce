import User from '../models/user.model.js';
import Permission from '../models/permission.model.js';
import Role from '../models/role.model.js';
import RoleModule from '../models/role-module.model.js';

const userRoleInclude = {
  model: Role,
  as: 'role',
  include: [
    {
      model: RoleModule,
      as: 'roleModules',
      include: [
        {
          model: Permission,
          as: 'permission',
        },
      ],
    },
  ],
};

export async function getUserByEmail(email) {
  return User.findOne({
    where: {
      email
    },
    include: [userRoleInclude],
  });
}

export async function createUser(data) {
  return User.create(data);
}

export async function getUserById(id) {
    return User.findOne({
        where:{
            id,
        },
        include: [userRoleInclude],
    })
}

export async function getAllUsers(){
  return User.findAll({
    include: [userRoleInclude],
    order: [['createdAt', 'DESC']],
  });
}

export async function updateUserProfile(id, data) {
  const user = await User.findOne({
    where: { id },
  });

  if (!user) {
    return null;
  }

  await user.update(data);

  return user;
}

export async function updateUser(user, data) {
  await user.update(data);

  return user;
}

export async function updateUserById(id, data) {
  const user = await User.findOne({
    where: { id },
  });

  if (!user) {
    return null;
  }

  await user.update(data);

  return user;
}

export async function assignUserRole(id, roleId) {
  const user = await User.findOne({
    where: { id },
  });

  if (!user) {
    return null;
  }

  await user.update({ roleId });

  return getUserById(id);
}

export async function deleteUserById(id) {
  const user = await User.findOne({ where: { id } });

  if (!user) {
    return null;
  }

  await user.destroy();

  return true;
}
