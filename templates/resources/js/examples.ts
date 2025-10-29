/**
 * Example usage of the type-safe API client
 * 
 * This file demonstrates how to use the auto-generated
 * API client with full type safety and runtime validation
 */

// Uncomment after running: npm run gen:types

/*
import { api } from './api/client';
import { UserDtoSchema } from './types/UserDto';

// Example 1: Fetch all users
async function getAllUsers() {
  try {
    const users = await api.getUsers();
    console.log('Users:', users);
    // users is typed as UserDto[] and runtime validated!
    
    users.forEach(user => {
      console.log(`${user.name} (${user.email})`);
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
}

// Example 2: Fetch single user
async function getUserById(id: string) {
  try {
    const user = await api.getUsersById(id);
    console.log('User:', user);
    // user is typed as UserDto
    
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// Example 3: Manual validation with Zod
async function fetchAndValidateUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const json = await response.json();
  
  // Runtime validation
  const user = UserDtoSchema.parse(json);
  
  // TypeScript knows the exact type now
  console.log(user.name);
  
  return user;
}

// Example 4: Type-safe error handling
async function safeUserFetch(id: string) {
  const result = UserDtoSchema.safeParse(
    await fetch(`/api/users/${id}`).then(r => r.json())
  );
  
  if (result.success) {
    console.log('Valid user:', result.data);
    return result.data;
  } else {
    console.error('Validation errors:', result.error.errors);
    return null;
  }
}

// Run examples
getAllUsers();
*/

export {};
