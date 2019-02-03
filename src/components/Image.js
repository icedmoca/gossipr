import React from "react";

export default class Image extends React.Component {
  state = { big: false }
  handleClick = () => this.setState({ big: !this.state.big })
  render() {
    const { src } = this.props
    return <img src={src}
      style={{ width: '100%', maxWidth: (this.state.big) ? 500 : 90 }}
      onClick={this.handleClick}
    />
  }
}