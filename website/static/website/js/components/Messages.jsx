import React from "react";

import Message from "./Message";

export default class Messages extends React.Component {

  componentDidUpdate() {
    if (this.props.messages.length > 0) {
        console.log("plop");
        this.refs.tbody.scrollTop = this.refs.tbody.scrollHeight;
    }
  }

  render() {
    const messages = [];
    let last = "";
    for (let msg of this.props.messages) {
        messages.push(<Message {...msg} separator={last != msg.user} />);
        last = msg.user;
    }

    return (
      <tbody ref="tbody">
        {messages}
      </tbody>
    )
  }
}
