const login = async (email, password) => {
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
      alert('Login successful');
      window.setTimeout(() => {
        location.assign('/');
      }, 750);
    }

    // console.log(result);
  } catch (err) {
    alert(err.response.data.message);
  }
};

document.querySelector('.form').addEventListener('submit', event => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  login(email, password);
});
