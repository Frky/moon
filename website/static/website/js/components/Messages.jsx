import React from "react";

import Message from "./Message";

export default class Messages extends React.Component {

  render() {
    const messages = [];
    let last = "";
    for (let msg of this.props.messages) {
        messages.push(<Message {...msg} separator={last != msg.user} />);
        last = msg.user;
    }

    return (
      <div>
        <div className="msg"></div>
        {messages}
      </div>
    )
  }
}
