<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Users List</h1>
    <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
      <thead>
        <tr class="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
          <th class="py-3 px-6 text-left">User ID</th>
          <th class="py-3 px-6 text-left">Username</th>
          <th class="py-3 px-6 text-left">Email</th>
          <th class="py-3 px-6 text-left">Role</th>
          <th class="py-3 px-6 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <!-- Example static data, replace with dynamic data -->
        <tr v-for="user in users" :key="user.id" class="border-b hover:bg-gray-100">
          <td class="py-3 px-6">{{ user.id }}</td>
          <td class="py-3 px-6">{{ user.username }}</td>
          <td class="py-3 px-6">{{ user.email }}</td>
          <td class="py-3 px-6">{{ user.role }}</td>
          <td class="py-3 px-6">
            <button @click="viewUser(user.id)" class="text-blue-600 hover:text-blue-800">View</button>
            <button @click="editUser(user.id)" class="ml-2 text-green-600 hover:text-green-800">Edit</button>
            <button @click="deleteUser(user.id)" class="ml-2 text-red-600 hover:text-red-800">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="mt-4">
      <button @click="loadMore" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Load More</button>
    </div>
  </div>
</template>

<script setup>

import { ref } from 'vue';
const users = ref([
  { id: 1, username: 'john_doe', email: 'sN4oC@example.com', role: 'admin' },
  { id: 2, username: 'jane_smith', email: 'V0Hs1@example.com', role: 'user' },
  // Add more static data or fetch from an API
]);
const viewUser = (id) => {
  console.log(`Viewing user ${id}`);
  // Implement view user logic
};
const editUser = (id) => {
  console.log(`Editing user ${id}`);
  // Implement edit user logic
};
const deleteUser = (id) => {
  console.log(`Deleting user ${id}`);
  // Implement delete user logic
};
const loadMore = () => {
  console.log('Loading more users');
  // Implement load more logic, e.g., fetch more data from an API
};
</script>
