import React from "react";
import { Chance }from "chance";

import WriteMessage from "./components/WriteMessage";
import Messages from "./components/Messages";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: chance.name(), messages: [], connected: false }
  }

  componentDidMount() {
    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    this.chatsock = new ReconnectingWebSocket(ws_scheme + '://' + window.location.host + "/chat" + window.location.pathname);

    this.chatsock.onopen = event => {
      this.setState({
        connected: true
      })
      console.log(this.chatsock);
    };

    this.chatsock.onclose = event => {
      this.setState({
        connected: false
      })
    };

    this.chatsock.onmessage = (message) => {
      console.log(message);
      let messages = this.state.messages.slice();
      messages.push(JSON.parse(message.data));
      this.setState({messages: messages})
    };
  }

  sendMessage(msg) {
    const payload = {
      handle: this.state.user,
      message: msg
    };
    this.chatsock.send(JSON.stringify(payload));
  }

  render() {
    return (
      <div>
        <h1>M O O N Y (<span>{this.state.connected ? 'connected' : 'disconnected'}</span>)</h1>
        <Messages
          messages={this.state.messages}
        />
        <WriteMessage
          sendMessage={this.sendMessage.bind(this)}
        />
      </div>
    )
  }
}