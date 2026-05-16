import { userResponse } from '../dto/user-response.dto.js';
import * as userService from '../services/user.service.js';

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const response = userResponse(user);
    res.success(response, 'User retrieved successfully');
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getAllUsers(req, res) {
    try{
        const users = await userService.getAllUsers();
        const response = users.map(user => userResponse(user));
        res.success(response, 'Users retrieved successfully');

    }catch(error){
        console.error("Error fetching users:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


export async function getProfile(req, res){
  try{
    const user = await userService.getUserById(req.user.id);
    const response = userResponse(user);
    res.success(response, 'Profile retrieved successfully');

  } catch(error){
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}