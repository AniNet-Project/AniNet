import React from 'react'

export default class Header extends React.Component {
  render() {
    return (
      <header>
        <div className="page-title">
          <div className="container">
            <a href="/">
              <p className="sub">AniNet</p>
            </a>
            <h1>{this.props.title}</h1>
          </div>
        </div>
      </header>
    )
  }
}
