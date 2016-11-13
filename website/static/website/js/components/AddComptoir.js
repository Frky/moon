import React from "react";

export default class AddComptoir extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newCmptrName: "",
    }
  }

  handleChange(evt) {
    this.setState({
      newCmptrName: evt.target.value,
    });
  }

  handleKeyDown(event) {
    if (event.keyCode == '13' && !event.shiftKey) {
      event.preventDefault();
      this.props.joinComptoir(this.refs.newcmptr.value); 
      this.setState({
        newCmptrName: "",
      });
    };
  }

  render() {
    return (
      <div className="add-comptoir comptoir">
        <div className="header">
            <input type="text" ref="newcmptr" name="new-cmptr" value={this.state.newCmptrName} onChange={this.handleChange.bind(this)} onKeyDown={this.handleKeyDown.bind(this)} placeholder="Join a comptoir..."/>
        </div>
      </div>
    )
  }
}
