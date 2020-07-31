import React from 'react'

type HeaderProps = {
  title: string;
}

export default class Header extends React.Component<HeaderProps, object> {
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
