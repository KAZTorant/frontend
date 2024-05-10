<template>
  <div class="login-container">
    <div class="mb-3 ip-address-input">
      <label for="ipAddress">IP Address: </label>
      <div class="ip">
        <input type="text" id="ipAddress" v-model="ipAddress" />
        <button @click="setIpAddress()">Daxil et</button>
      </div>
    
    </div>
    <div name="login-form" class="login-form">     
      <div class="mb-3 username-input">
        <label for="username">PIN: </label>
        <input type="password" id="username" v-model="input.username" />
      </div>
      <div class="keypad">
        <button v-for="n in 9" :key="n" class="btn number" @click="pressKey(n)">{{ n }}</button>
        <button class="btn number zero" @click="pressKey(0)">0</button>
        <button class="btn control clear" @click="clearusername">Təmizlə</button>
        <button class="btn control enter" type="submit" @click="login()">Daxil ol</button>
      </div>
    </div>
    <h3 class="output">{{ output }}</h3>  
  </div>
</template>

<script>
import backendServices from '../backend-services/backend-services'; // Update the path accordingly
import router from '@/router/'; // Import the router instance

export default {
  name: 'LoginView',
  data() {
    return {
      input: {
        username: ""
      },
      output: "",
      ipAddress: ""
    }
  },
  methods: {
    setIpAddress(){
      this.$store.commit(`auth/SET_IP_ADDRESS`, this.ipAddress);
      window.location.reload(true);
    },
    pressKey(n) {
      this.input.username += n.toString();
    },
    clearusername() {
      this.input.username = "";
    },
    async login() {
      if (this.input.username != "") {
        console.log(this.input.username);

        try {
          // Call the login method from backendServices
          const userData = await backendServices.login(this.input.username);

          this.output = "Authentication complete";
          // Dummy authentication logic, replace with actual logic
          this.$store.commit(`auth/SET_AUTHENTICATION`, true);
          this.$store.commit(`auth/SET_ROLE`, userData.role); // Assuming you are using username for username here
          this.$store.commit(`auth/SET_USERNAME`, userData.username); // Assuming you are using username for username here
          this.$store.commit(`auth/SET_FULL_NAME`, userData.full_name); // Assuming you are using username for username here
          this.$router.push('/home');
        } catch (error) {
          console.error('Error during login:', error);
          this.output = "Yanlış PİN!";
        }
      } else {
        this.output = "Boş qeyd edilə bilməz!";
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

.ip-address-input label,
.username-input label {
  display: block;
  margin-bottom: 8px;
}

.ip {
  display: flex;
}

.ip input {
  flex: 1;
  padding: 8px;
}

.ip button {
  width: 150px;
  padding: 8px 10px;
  cursor: pointer;
}

.username-input input {
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
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
  grid-column: span 2; /* Make the 0 button wide */
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
