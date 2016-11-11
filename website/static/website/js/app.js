import React from "react";

import { Comptoir } from "./components/";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      comptoirs: {},
      messages: [],
      users: []
    };

    this.selectedComptoirs = ['plop', 'yolo'];

    // Init socket connection (contains setState refresh)
    this._initSocketConnection();

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
      output[c] = {messages: [], users: []}
    }
    return output
  }

  sendMessage(msg) {
    this.chatsock.send(JSON.stringify(msg));
  }

  componentDidUpdate() {
    if (this.state.connected) {
      document.title = '🌕 M O O N 🌕'
    } else {
      document.title = '🌑 M O O N 🌑'
    }
  }

  render() {
    const comptoirsHTML = this.selectedComptoirs.map(c => (
      <Comptoir
        name={c}
        connected={this.state.connected}
        sendMessage={this.sendMessage.bind(this)}
        {...this.state.comptoirs[c]}
      />
    ));

    return (
      <div className="chatbox">
        <h1>M O O N Y (<span>{this.state.connected ? 'connected' : 'disconnected'}</span>)</h1>
        <hr/>
        
        {comptoirsHTML}
      </div>
    )
  }
}
