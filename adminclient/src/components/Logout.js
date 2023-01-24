import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Login.css';
import useToken from '../useToken';
import { useHistory } from 'react-router-dom';
var serversettings = require('../serversettings.js');

async function loginUser() {
    debugger
    var token = JSON.parse(localStorage.token).token

    return fetch('http://'+serversettings.adminhost+':'+serversettings.adminport+'/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
    })
        .then(data => data.json())
}


export default function Logout() {
    const { token, setToken } = useToken();
    const history = useHistory();
    loginUser()
    localStorage.clear('token')
    history.push("/login");

    return (
        <div className="login-wrapper">

        </div>
    )
}

// Logout.propTypes = {
//     setToken: PropTypes.func.isRequired
// };