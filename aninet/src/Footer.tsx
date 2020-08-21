import React from 'react'
import GitHubIcon from '@material-ui/icons/GitHub';
import EmailIcon from '@material-ui/icons/Email';


export default class Footer extends React.Component<object, object> {
  render() {
    return (
      <div className="footer">
        <div className="container">
          <a href="https://github.com/Nanguage/AniNet">
            <GitHubIcon/>
          </a>
          <a href="mailto:nanguage@yahoo.com">
            <EmailIcon id="email-icon"/>
          </a>
        </div>
      </div>
    )
  }
}
