import React from "react";
import Comptoir from "./Comptoir";
import AddComptoir from "./AddComptoir";

import _ from 'underscore';

export default class Bar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focus: "",
      newCmptrName: "",
      idFocused: 0
    };
  }

  changeFocus(items, name) {
    this.setState({idFocused: Object.keys(items).indexOf(name)});
  }

  handleChange(evt) {
    this.setState({
      newCmptrName: evt.target.value,
    });
  }

  handleKeyDown(evt) {
    if (evt.keyCode == 13) 
        this.joinComptoir(evt);
  }

  handleBroadcast(message) {
    this.props.sendMessage({
      action: 'BROADCAST',
      message: message,
      comptoirs: Object.keys(this.props.comptoirs)
    });
  }

  nextFocusedId(items, direction=1) {
    return (this.state.idFocused + direction) % Object.keys(items).length
  }

  handleTab() {
    this.setState({idFocused: this.nextFocusedId(this.props.comptoirs)});
  }

  joinComptoirName(cmptr) {
    this.props.joinComptoir(cmptr);
  }

  joinComptoir(evt) {
    this.joinComptoirName(this.refs.newcmptr.value); 
  }

  componentWillReceiveProps(nextProps) {
    const oldComptoirs = Object.keys(this.props.comptoirs);
    const newComptoirs = Object.keys(nextProps.comptoirs);
    if (oldComptoirs.length < newComptoirs.length) {
      this.changeFocus(nextProps.comptoirs, _.difference(newComptoirs, oldComptoirs)[0])
    }
  }

  render() {
    const comptoirsHTML = Object.keys(this.props.comptoirs).map((c, i) => {
      return (<Comptoir
        name={c}
        connected={this.props.connected}
        isFocused={i == this.state.idFocused}
        windowFocused={this.props.windowFocused}
        sendMessage={this.props.sendMessage}
        readMessages={this.props.readMessages}
        leaveComptoir={this.props.leaveComptoir}
        joinComptoir={this.joinComptoirName.bind(this)}
        handleBroadcast={this.handleBroadcast.bind(this)}
        handleTab={this.handleTab.bind(this)}
        changeFocus={this.changeFocus.bind(this, this.props.comptoirs)}
        {...this.props.comptoirs[c]}
        key={`comptoir-${c}`}
      />)
  });

    return (
      <div className="bar">
        <div className="header">
        </div>
        <div className="comptoir-container">
          {comptoirsHTML}
          <AddComptoir
            joinComptoir={this.props.joinComptoir.bind(this)} 
          />
        </div>
      </div>
    )
  }
}
