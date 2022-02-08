import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  console.log(email, password);
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://localhost:4000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (result.data.status === 'success') {
      showAlert('success', 'Login successful');
      window.setTimeout(() => {
        location.assign('/');
      }, 750);
    }

    // console.log(result);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
