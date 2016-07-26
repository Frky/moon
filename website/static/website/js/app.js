import React from "react";
import { Chance }from "chance";

import WriteMessage from "./components/WriteMessage";
import Messages from "./components/Messages";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: chance.name(), messages: [] }
  }

  componentDidMount() {
    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    this.chatsock = new ReconnectingWebSocket(ws_scheme + '://' + window.location.host + "/chat" + window.location.pathname);

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
        <h1>M O O N Y</h1>
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