<template>
  <div class="login">
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="form.username" placeholder="Username" required />
      <input v-model="form.password" type="password" placeholder="Password" required />
      <select v-model="form.role">
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button type="submit">Login</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import axios from "axios";
import { useRouter } from "vue-router";
import { reactive, ref } from "vue";

const router = useRouter();

const form = reactive({
  username: "",
  password: "",
  role: "USER",
});

const errorMessage = ref("");

const handleLogin = async () => {
  try {
    const response = await axios.post("http://localhost:3000/api/auth/login", {
      username: form.username,
      password: form.password,
    });

    // Extract token and user data
    const { token, user } = response.data;

    // Log the user role to check its value
    console.log("User role:", user.role);

    // Save token and user information in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("username", user.username);
    localStorage.setItem("role", user.role);

    // Redirect to the appropriate page after successful login
    if (user.role === "ADMIN") {
      router.push("/dashboard");
    } else {
      router.push("/facility");
    }
  } catch (error) {
    // Show error message if login fails
    errorMessage.value = error.response?.data?.message || "Terjadi kesalahan!";
  }
};
</script>

<style scoped>
.login {
  text-align: center;
  margin-top: 50px;
}
input,
select,
button {
  display: block;
  margin: 10px auto;
  padding: 10px;
  width: 200px;
}
button {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>