import React from "react";

import Message from "./Message";

export default class Messages extends React.Component {
  render() {
    const messages = this.props.messages.map(msg => (
      <Message {...msg} />
    ))

    return (
      <div>{messages}</div>
    )
  }
}