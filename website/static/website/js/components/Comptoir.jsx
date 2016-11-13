import React from "react";
import WriteMessage from "./WriteMessage";
import Messages from "./Messages";

export default class Comptoir extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isJoined: false
    };
  }

  join() {
    if (this.props.connected && !this.state.isJoined) {
      this.props.sendMessage({
        action: 'JOIN',
        comptoir: this.props.name
      });
      this.setState({isJoined: true});
    }
  }

  leave(evt) {
    evt.preventDefault();
    this.props.leaveComptoir(this.props.name)
  }

  componentDidMount() {
    this.join();
  }

  componentDidUpdate() {
    this.join();
    if (this.props.messages.length > 0) {
        this.refs.msgs.scrollTop = this.refs.msgs.scrollHeight;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.connected && !nextProps.connected) {
      this.setState({isJoined: false});
    }
  }

  handleCommand(cmd) {
    switch (true) {
      case cmd == '/leave':
        this.props.leaveComptoir(this.props.name);
        break;
      case cmd.startsWith('/all '):
        this.props.handleBroadcast(cmd.replace('/all ', ''));
        break;
    }
  }
  
  handleFocus() {
    this.props.changeFocus(this.props.name);
  }

  sendMessage(message) {
    if (message.startsWith('/')) {
      this.handleCommand(message);
      return
    }

    if (message == '') {
      return
    }

    this.props.sendMessage({
      action: 'MSG',
      message: message,
      comptoir: this.props.name
    });
  }

  render() {
    return (
      <div className="comptoir" onClick={this.handleFocus.bind(this)}>
        <div className="header">
            {this.props.name} <a href="" onClick={this.leave.bind(this)}>leave</a>
            - {this.props.connected ? this.props.users.join(',') : '~'}
            {/*<div>{this.state.users.join(', ')} connected</div>*/}
        </div>
        <div className="messages" ref="msgs">
          <Messages
            messages={this.props.messages}
          />
        </div>
        <div className="footer">
          <WriteMessage
            sendMessage={this.sendMessage.bind(this)}
            focus={this.props.isFocused || false}
            handleTab={this.props.handleTab}
          />
        </div>
      </div>
    )
  }
}
