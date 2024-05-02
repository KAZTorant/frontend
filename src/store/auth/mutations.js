export default {

    SET_AUTHENTICATION(state, authenticated) {
        state.authenticated = authenticated
    },
    SET_USERNAME(state, username) {
        state.username = username
    },
    SET_ROLE(state, role) {
        state.role = role
    },
    SET_FULL_NAME(state, full_name) {
        state.full_name = full_name;
      }
}