import User from '../models/user.model.js';

export async function getUserByEmail(email) {
  return User.findOne({
    where: {
      email
    }
  });
}

export async function createUser(data) {
  return User.create(data);
}

export async function getUserById(id) {
    return User.findOne({
        where:{
            id,
        }
    })
}

export async function getAllUsers(){
  return User.findAll();
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
