<template>
  <div class="login-container">
    <div name="login-form" class="login-form">     
      <div class="mb-3 username-input">
        <label for="username">PIN: </label>
        <input disabled type="password" id="username" v-model="input.username" />
      </div>
      <div class="keypad">
        <button v-for="n in 9" :key="n" class="btn number" @click="pressKey(n)">{{ n }}</button>
        <button class="btn number zero" @click="pressKey(0)">0</button>
        <button class="btn control clear" @click="clearusername">Təmizlə</button>
        <button class="btn control enter" type="submit" @click="login()">Daxil ol</button>
      </div>
    </div>
    <h3 class="output">{{ output }}</h3>
    <div v-if="isDesktop && networkAddress" class="qr-code">
      <qrcode :value="networkAddress" :size="200"></qrcode>
      <p>Sistemə daxil ol</p>
    </div>
  </div>
</template>

<script>
import Qrcode from 'vue-qrcode';
import backendServices from '../backend-services/backend-services'; // Update the path accordingly
import router from '@/router/'; // Import the router instance

export default {
  name: 'LoginView',
  components: {
    Qrcode
  },
  data() {
    return {
      input: {
        username: ""
      },
      output: "",
      networkAddress: "",
      isDesktop: window.innerWidth >= 1024 // initial value
    }
  },
  methods: {
    async getNetworkAddress() {
      const privateIpAddress = await this.getLocalIP();
      const networkAddress = `http://${privateIpAddress}:8080/`; // Example static IP
      return networkAddress;
    },
    async getLocalIP() {
      const result = await await backendServices.getNetworkAddress();
      return result.network_ip;
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
          const userData = await backendServices.login(this.input.username);
          this.output = "Authentication complete";
          this.$store.commit(`auth/SET_AUTHENTICATION`, true);
          this.$store.commit(`auth/SET_ROLE`, userData.role);
          this.$store.commit(`auth/SET_USERNAME`, userData.username);
          this.$store.commit(`auth/SET_FULL_NAME`, userData.full_name);
          const rooms = await backendServices.fetchRooms();
          if (rooms !== null && rooms.length > 0) {
            this.$router.push('/home/' + rooms[0].id);
          }
        } catch (error) {
          console.error('Error during login:', error);
          this.output = "Yanlış PİN!";
          this.input.username = ""; 
        }
      } else {
        this.output = "Boş qeyd edilə bilməz!";
      }
    },
    handleResize() {
      this.isDesktop = window.innerWidth >= 1024;
    }
  },
  async created() {
    this.networkAddress = await this.getNetworkAddress();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  }
}
</script>

<style>
.login-container {
  width: 100%;
  height: 100vh;
  background-image: url("/src/assets/login-back.jpg");
  background-size: cover;
  background-position: center;
  margin-top: -40px;
  padding-top: 40px;
  overflow-y: auto;
}

.login-form {
  max-width: 400px;
  background-color: white;
  margin: auto;
  padding: 20px;
  border: 1px solid #000;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
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
  color: #fff;
}

.qr-code {
  text-align: center;
  margin-top: 20px;
  color: #fff;
}
</style>
