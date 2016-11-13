import React from "react";
import cookie from 'react-cookie';

import { Bar, Comptoir } from "./components";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      comptoirs: {},
      messages: [],
      users: []
    };

    // Init socket connection (contains setState refresh)
    this._initSocketConnection();
    this._initHeartbeat();

    if (window.location.pathname == '/u/agora') {
        this.selectedComptoirs = cookie.load('opencmptrs');
        if (this.selectedComptoirs == undefined)
            this.selectedComptoirs = [];
        this.state.is_bar = true;
    } else {
        this.selectedComptoirs = [window.location.pathname.replace('/u/', '')];
        this.state.is_bar = false;
    }

    // Hack: TODO something dynamic
    this.state.comptoirs = this._initComptoirState(this.selectedComptoirs);
  }

  _initSocketConnection() {
    // Connection with the websocket
    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    this.chatsock = new ReconnectingWebSocket(ws_scheme + '://' + window.location.host + "/chat");
    console.log('did mount', this.chatsock);

    // OnOpen callback
    this.chatsock.onopen = event => {
      this.setState({
        connected: true
      });

    };

    // OnClose callback
    this.chatsock.onclose = event => {
      this.setState({
        connected: false
      })
    };

    this.chatsock.onmessage = (message) => {
      const data = JSON.parse(message.data);
      const action = data.action;

      if (action == 'MSG') {
        this.state.comptoirs[data.comptoir].messages.push(data);
        this.setState({});
      } else if (action == 'PRESENCE') {
        this.state.comptoirs[data.comptoir].users = data.users;
        this.setState({});
      }
      //let messages = this.state.messages.slice();

      /*if (Object.keys(data).indexOf('users') >= 0) {
        console.log(data);
        this.setState({ users: data.users });
      } else {
        messages.push(JSON.parse(message.data));
        this.setState({ messages: messages });
      }*/
    };
  }

  _initComptoirState(comptoirs) {
    const output = {}
    for (let c of comptoirs) {
      output[c] = {messages: [], users: []};
    }
    return output
  }

  _initHeartbeat() {
    setInterval(
      () => this.sendMessage({action: 'heartbeat'})
      , 30000);
  }

  sendMessage(msg) {
    this.chatsock.send(JSON.stringify(msg));
  }

  joinComptoir(cmptr) {
    this.state.comptoirs[cmptr] = {messages: [], users: []};
    this.setState({});
  }

  leaveComptoir(cmptr) {
    this.sendMessage({
      action: 'LEAVE',
      comptoir: cmptr
    });
    delete this.state.comptoirs[cmptr];
    this.setState({});
  }

  componentDidUpdate() {
    if (this.state.connected) {
      document.title = '🌕 M O O N 🌕';
    } else {
      document.title = '🌑 M O O N 🌑';
    }
    cookie.save('opencmptrs', JSON.stringify(Object.keys(this.state.comptoirs)));
  }

  render() {
    let comptoirsHTML;
    if (this.state.is_bar) {
      comptoirsHTML = (
        <Bar 
            sendMessage={this.sendMessage.bind(this)} 
            joinComptoir={this.joinComptoir.bind(this)}
            leaveComptoir={this.leaveComptoir.bind(this)}
            connected={this.state.connected}
            comptoirs={this.state.comptoirs}
        />
      );
    } else {
      const cmptr = window.location.pathname.replace('/u/', '');
      comptoirsHTML = (
        <Comptoir
          name={cmptr}
          connected={this.state.connected}
          sendMessage={this.sendMessage.bind(this)}
          {...this.state.comptoirs[cmptr]}
        />
      );
    }
    return (
      <div>
        {comptoirsHTML}
      </div>
    );
  }
}
