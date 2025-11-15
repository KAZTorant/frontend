<template>
  <div class="login-container">
    <div v-if="networkAddress" class="qr-code">
      <qrcode :value="networkAddress" :size="200" color="#000000" type="image/png" style="width: 300px; border: 10px solid transparent; outline: 10px dashed var(--primary-color); height: 300px;"></qrcode>
      <p>Ofisiant kimi daxil ol</p>
    </div>
    <div>
      <div name="login-form" class="login-form">     
        <div class="mb-3 username-input">
          <label for="username">PIN: </label>
          <input disabled type="password" id="username" v-model="input.username" />
        </div>
        <div class="keypad">
          <button v-for="n in 9" :key="n" class="btn number" @click="pressKey(n)">{{ n }}</button>
          <button class="btn number zero" @click="pressKey(0)">0</button>
          <button class="btn control clear" @click="clearusername">Təmizlə</button>
          <button class="btn control enter" @click="login()">Daxil ol</button>
        </div>
        
      </div>
      <h3 class="output">{{ output }}</h3>
    </div>
    
    
  </div>
</template>

<script>
import Qrcode from 'vue-qrcode';
import backendServices from '../backend-services/backend-services'; // Update the path accordingly

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
  watch: {
    // Add a watcher for the username to automatically login when length is 4
    'input.username': function(newVal) {
      if (newVal.length === 4) {
        this.login();
      }
    }
  },
  methods: {
    async getNetworkAddress() {
      const privateIpAddress = await this.getLocalIP();
      // Remove any existing port from the IP address (only if backend returns IP:PORT)
      const cleanIp = privateIpAddress.includes(':') ? privateIpAddress.split(':')[0] : privateIpAddress;
      const frontendPort = process.env.VUE_APP_FRONTEND_PORT || '8080';
      const frontendProtocol = process.env.VUE_APP_FRONTEND_PROTOCOL || 'http';
      const networkAddress = `${frontendProtocol}://${cleanIp}:${frontendPort}/`;
      return networkAddress;
    },
    async getLocalIP() {
      const result = await backendServices.getNetworkAddress();
      return result.network_ip;
    },
    pressKey(n) {
      // Only add digit if less than 4 characters
      if (this.input.username.length < 4) {
        this.input.username += n.toString();
      }
    },
    clearusername() {
      this.input.username = "";
      this.output = ""; // Also clear any error messages
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
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
}
</script>

<style>
.login-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  height: 100vh;
  background-image: url("/src/assets/login-back.jpg");
  background-size: cover;
  background-position: center;
  padding-top: 40px;
  overflow-y: auto;
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
  z-index: 0;
}

.login-form, .qr-code {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.login-form {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.98));
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.mb-3 {
  margin-bottom: 20px;
}

.ip-address-input label,
.username-input label {
  display: block;
  margin-bottom: 10px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1em;
}

.ip {
  display: flex;
  gap: 10px;
}

.ip input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
}

.ip input:focus {
  border-color: #2ecc71;
  outline: none;
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
}

.ip button {
  width: 150px;
  padding: 12px;
  cursor: pointer;
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.ip button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
}

.username-input input {
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1.2em;
  text-align: center;
  letter-spacing: 2px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 20px 0;
  font-size: 1.5rem;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 600;
}

.number {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  color: #2c3e50;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.number:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.number.zero {
  grid-column: span 2;
}

.control {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  box-shadow: 0 4px 8px rgba(46, 204, 113, 0.2);
}

.control:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(46, 204, 113, 0.3);
}

.clear {
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  color: white;
  box-shadow: 0 4px 8px rgba(255, 82, 82, 0.2);
}

.clear:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(255, 82, 82, 0.3);
}

.enter {
  grid-column: 3 / 4;
}

.output {
  text-align: center;
  margin-top: 20px;
  color: #ff6b6b;
  font-weight: 600;
  font-size: 1.1em;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.qr-code {
  text-align: center;
  margin-top: 20px;
  color: white;
  font-weight: bold;
  font-size: 24px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.qr-code p {
  margin-top: 20px;
  font-size: 1.2em;
}

@media (max-width: 1024px) {
  .login-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    row-gap: 40px;
    padding: 20px;
  }
  
  .qr-code {
    order: 2;
  }

  .login-form {
    order: 1;
  }
}

@media (max-width: 500px) {
  .qr-code {
    display: none;
  }
  
  .login-form {
    padding: 20px;
  }
  
  .btn {
    padding: 15px 0;
    font-size: 1.3rem;
  }
}
</style>