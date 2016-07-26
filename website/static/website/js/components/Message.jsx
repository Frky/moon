import React from "react";

export default class Message extends React.Component {
  render() {
    return (
      <div>
        <span>[<b>{this.props.handle}</b>]</span><br/>
        <span>{this.props.message}</span>
      </div>
    )
  }
}