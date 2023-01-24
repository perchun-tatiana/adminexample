import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Login.css';
import useToken from '../useToken';
// import { withRouter } from 'react-router';
import { useHistory } from 'react-router-dom';
var serversettings = require('../serversettings.js');

function withMyHook(Component) {
  return function WrappedComponent(props) {
    const history = useHistory();
    return <Component {...props} history={history} />;
  }
}

async function loginUser(credentials) {
    debugger
 return fetch('http://'+serversettings.adminhost+':'+serversettings.adminport+'/login', {
   method: 'POST',
   headers: {
     'Content-Type': 'application/json'
   },
   body: JSON.stringify(credentials)
 })
   .then(data => data.json())
}

function Login() {
  const { token, setToken } = useToken();
  debugger
  const history = useHistory();

  const [username, setUserName] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = async e => {
    e.preventDefault();
    const token = await loginUser({
      username,
      password
    });
    if (token.token){
        setToken(token);
        debugger
        
        history.push("/dashboard");
    }else{
        alert('Не правильный логин или пароль')
    }
  }

  return(
    <div className="login-wrapper">
      <h1>Please Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Username</p>
          <input type="text" onChange={e => setUserName(e.target.value)} />
        </label>
        <label>
          <p>Password</p>
          <input type="password" onChange={e => setPassword(e.target.value)} />
        </label>
        <div>
          <button style={{'margin-top': '20px' }} type="submit">Submit</button>
        </div>
      </form>
    </div>
  )
}

// Login.propTypes = {
//   setToken: PropTypes.func.isRequired
// };

// export default withRouter(Login);


export default withMyHook(Login);