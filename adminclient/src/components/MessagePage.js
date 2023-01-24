import React, { Component } from 'react'
import './MessagePage.css';
import { useHistory } from 'react-router-dom';
// import Modal from "./Modal"
import ReactPlayer from 'react-player'
import ReactAudioPlayer from 'react-audio-player';
// import { ComboBox } from "@progress/kendo-react-dropdowns";
// import Dropdown from 'react-dropdown';
// import Select from "react-dropdown-select";
import Select from 'react-select';
// import 'react-dropdown/style.css';
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
var serversettings = require('../serversettings.js');



async function loginUser(chatid) {

  var token = JSON.parse(localStorage.token).token
  return fetch('http://' + serversettings.adminhost + ':' + serversettings.adminport + '/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ chatid: chatid, token: token })
  })
    .then(data => data.json())
}

async function sendmess(chatid, message) {

  var token = JSON.parse(localStorage.token).token

  return fetch('http://' + serversettings.adminhost + ':' + serversettings.adminport + '/sendmessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ chatid: chatid, message: message, token: token })
  })
    .then(data => data.json())
}


function withMyHook(Component) {
  return function WrappedComponent(props) {
    const history = useHistory();
    return <Component {...props} history={history} />;
  }
}

class Table extends Component {

  constructor(props) {
    // const { token, setToken } = useToken();

    super(props);

    this.state = {
      isFetching: false,
      chatid: '',
      messages: [],
      user: {},
      showModal: false
    };

    this.emailInput = React.createRef();
    this.addHelp = this.addHelp.bind(this);
  }

  renderMesages() {
    if (this.state.messages) {
      for (let i = 0; i < this.state.messages.length; i++) {
        if (this.state.messages[i].type != 'text' && this.state.messages[i].filename !== 'undefined.mp4') {
          try {
            var tempfile = require('../../videos/' + this.state.messages[i].filename)

            this.state.messages[i].url = tempfile.default
          } catch (error) {

          }

        }

      }
    }

    return this.state.messages.map((item, index) => {
      if (item.type == 'text') {
        if (item.text && item.text.indexOf('https://t.me/') != -1) {
          var temptext = item.text.split('\n')[0]
          var classtemp = item.people ? 'people' : 'bot'

          return <Message model={{
            direction: item.direction,
            type: "custom"
          }}>
            <Message.CustomContent>
              <a href={temptext}>{item.text}</a>
            </Message.CustomContent>
            <Message.Footer sender="Emily" sentTime={item.date} />

          </Message>
        } else {
          return <Message
            model={{
              direction: item.direction,
              message: item.text,
              // sentTime: item.date,
              sender: item.sender,
              position: "last"
            }}
          >
            <Message.Footer sender="Emily" sentTime={item.date} />
          </Message>
        }
      } else if (item.type == 'photo') {
        return <Message type="image" model={{
          direction: item.direction,
          payload: {
            src: item.url,
            alt: "Photo",
            width: "100px"
          },
          position: "last"
        }}>
          <Message.Footer sender="Emily" sentTime={item.date} />

        </Message>
      } else if (item.type == 'audio') {
        return <Message model={{
          direction: item.direction,
          type: "custom"
        }}>
          <Message.CustomContent>
            <ReactAudioPlayer
              src={item.url}
              // autoPlay
              controls
            />
          </Message.CustomContent>
          <Message.Footer sender="Emily" sentTime={item.date} />

        </Message>

      } else if (item.type == 'video') {
        return <Message model={{
          direction: item.direction,
          type: "custom"
        }}>
          <Message.CustomContent>
            <ReactPlayer url={item.url} controls='true' />
          </Message.CustomContent>
          <Message.Footer sender="Emily" sentTime={item.date} />

        </Message>


      }
    })
  }

  handleOnSendMessage = (message, text) => {
    var chatid = this.props.history.location.search ? this.props.history.location.search.replace('?', '') : ''
    sendmess(chatid, text)

    this.fetchUsers();

    setTimeout(() => {
      this.fetchUsers();

    }, 1000 * 80);

  };
  async changeemail(chatid, email) {

    var token = JSON.parse(localStorage.token).token

    return fetch('http://' + serversettings.adminhost + ':' + serversettings.adminport + '/changeemail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ chatid: chatid, email: email, token: token })
    })
      .then(data => data.json())
  }

  async addHelp() {
    var chatid = this.props.history.location.search ? this.props.history.location.search.replace('?', '') : ''
    const email = this.emailInput.current.value;
    var data = await this.changeemail(chatid, email)
    if (data && data.result == 'success') {
      alert('Email пользователя изменен')
    } else {
      alert('Ошибка сохранения')

    }
    this.setState({
      messages: this.messages,
      user: this.user,
      modal: false
    })
    this.fetchUsers();
  }

  async fetchUsers() {

    var chatid = this.props.history.location.search ? this.props.history.location.search.replace('?', '') : ''
    var data = await loginUser(chatid)
    if (data.redirect) {
      this.props.history.push(`/logout`);

    } else {
      debugger
      this.setState({
        chatid: data.user.chatid,
        user: data.user,
        messages: data.messages,
        showModal: false
      })
    }
  }

  async markasread(chatid) {

    var token = JSON.parse(localStorage.token).token

    return fetch('http://' + serversettings.adminhost + ':' + serversettings.adminport + '/markasread', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ chatid: chatid, token: token })
    })
      .then(data => data.json())
  }

  async setModal(flag) {
    debugger
    this.setState({
      chatid: this.state.chatid,
      user: this.state.user,
      messages: this.state.messages,
      modal: flag
    })

  }
  async isModal() {
    return this.state.modal

  }

  componentDidMount() {
    this.fetchUsers();
    // this.timer = setInterval(() => this.fetchUsers(), 5000);
  }


  render() {


    var chatid = this.props.history.location.search ? this.props.history.location.search.replace('?', '') : ''

    if (this.state.messages) {
      for (let i = 0; i < this.state.messages.length; i++) {
        if (this.state.messages[i].type != 'text' && this.state.messages[i].filename !== 'undefined.mp4') {
          try {
            var tempfile = require('../../videos/' + this.state.messages[i].filename)

            this.state.messages[i].url = tempfile.default
          } catch (error) {

          }

        }

      }
    }

    const handleOnMarkAsRead = (chatid) => {
      this.markasread(chatid)

      setTimeout(() => {
        this.fetchUsers();

      }, 1000 * 80);

    };
    const Modal = ({ isVisible = false, title, content, footer, onClose }) => {
      const keydownHandler = ({ key }) => {
        switch (key) {
          case 'Escape':
            onClose();
            break;
          default:
        }
      };

      React.useEffect(() => {
        document.addEventListener('keydown', keydownHandler);
        return () => document.removeEventListener('keydown', keydownHandler);
      });

      return !isVisible ? null : (
        <div className="modal" onClick={onClose}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{title}</h3>
              <span className="modal-close" onClick={onClose}>
                &times;
              </span>
            </div>
            <div className="modal-body">
              <div className="modal-content">{content}</div>
            </div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      );
    };
    var email = this.state.user ? this.state.user.email : ''
    return (
      <div  >
        <h3 style={{ 'margin-left': '30px' }} id='title' style={{ float: 'left', 'margin-right': '10px' }} >Chatid: {chatid}</h3>
        <h3 style={{ 'margin-left': '30px' }} id='title' style={{ float: 'left', 'margin-right': '10px' }} >Email: {email}</h3>
        <button name="markasread" style={{ float: 'right', 'margin-top': '20px' }} onClick={handleOnMarkAsRead}>Прочитано</button>
        <button name="help" style={{ float: 'right', 'margin-top': '20px', 'margin-right': '20px' }} onClick={(atr) => this.setModal(true)}>Помочь с email</button>
        <Modal

          isVisible={this.state.modal}
          title="Введите правильный email"
          content={<div>
            <input ref={this.emailInput} type="text" name="input" style={{ 'width': '100%' }} />
          </div>}
          footer={<button id={this.state.objid} onClick={(atr) => this.addHelp(atr)}>Сохранить</button>}
          onClose={() => this.setModal(false)}
        />
        <MainContainer style={{ clear: 'left', display: 'block' }}>
          <ChatContainer>
            <MessageList>
              {this.state.messages &&
                this.renderMesages()}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={this.handleOnSendMessage} />
          </ChatContainer>
        </MainContainer>
      </div>
    )
  }
}


export default withMyHook(Table);
