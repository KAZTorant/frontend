<template>
  <div class="login-container">
    <div name="login-form" class="login-form">
      <div class="mb-3 username-input">
        <label for="username">username: </label>
        <input type="text" id="username" v-model="input.username" disabled />
      </div>
      <div class="keypad">
        <button v-for="n in 9" :key="n" class="btn number" @click="pressKey(n)">{{ n }}</button>
        <button class="btn number zero" @click="pressKey(0)">0</button>
        <button class="btn control clear" @click="clearusername">Clear</button>
        <button class="btn control enter" type="submit" @click="login()">Enter</button>
      </div>
    </div>
    <h3 class="output">Output: {{ output }}</h3>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'LoginView',
  computed: {
    ...mapGetters(['IS_USER_AUTHENTICATED'])
  },
  mounted() {
    console.log('state is user uathenticated')
    console.log(this.IS_USER_AUTHENTICATED); // This should now display the correct value
  },
  data() {
    return {
      input: {
        username: ""
      },
      output: ""
    }
  },
  methods: {
    pressKey(n) {
      this.input.username += n.toString();
    },
    clearusername() {
      this.input.username = "";
    },
    login() {
      if (this.input.username != "") {
        console.log(this.input.username)

        this.output = "Authentication complete";
        // Dummy authentication logic, replace with actual logic
        this.$store.commit(`auth/SET_AUTHENTICATION`, true);
        this.$store.commit(`auth/SET_USERNAME`, this.input.username); // Assuming you are using username for username here
        this.$router.push('/home');
      } else {
        this.output = "username cannot be empty";
      }
    }
  }
}
</script>

<style>
.login-container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  border: 1px solid #000;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.mb-3 {
  margin-bottom: 16px;
}

.user-input label,
.username-input label {
  display: block;
  margin-bottom: 8px;
}

.user-input input,
.username-input input {
  width: 100%;
  padding: 8px;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  margin-top: 20px;
}

.btn {
  padding: 20px 0;
  font-size: 1.5rem;
  border: 1px solid #000;
  background-color: #fff;
  cursor: pointer;
}

.number {
  background-color: #fff; /* Numbers are white */
}

.number.zero {
  grid-column: 1 / 3; /* Make the 0 button wide */
}

.control {
  background-color: #4CAF50; /* Control buttons are green */
  color: #fff;
}

.clear {
  background-color: #f44336; /* Clear button is red */
  color: #fff;
}

.enter {
  grid-column: 3 / 4; /* Align the Enter button to the right */
}

.output {
  text-align: center;
  margin-top: 20px;
}
</style>
