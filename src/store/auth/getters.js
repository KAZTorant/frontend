export default {
    IS_USER_AUTHENTICATED(state) {
      return state.authenticated;
    },
    GET_USERNAME(state) {
      return state.username;
    },
    GET_ROLE(state) {
      return state.role;
    },
    GET_FULL_NAME(state) {
      return state.full_name;
    },
    GET_IP_ADDRESS(state) {
      return state.ip_address;
    }
  }
  