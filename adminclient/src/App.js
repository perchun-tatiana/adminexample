import React, { useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import './App.css';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Logout from './components/Logout';
import MessagePage from './components/MessagePage';
import MessageList from './components/MessageList';
import PostList from './components/PostList';
import useToken from './useToken';

function App() {
  const { token, setToken } = useToken();



  if (!token) {
    return <BrowserRouter>
      <Switch>

        <Route path="/login">
          <Login setToken={setToken} />
        </Route>

      </Switch>
    </BrowserRouter>

  }


  return (
    <div className="wrapper">
      {/* <h1>Application</h1> */}
      <BrowserRouter>
        <Switch>
          <Route path="/dashboard">
            <Dashboard />
          </Route>
          <Route path="/messages">
            <MessagePage />
          </Route>
          <Route path="/messlist">
            <MessageList />
          </Route>
          <Route path="/postlist">
            <PostList />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/logout">
            <Logout />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;