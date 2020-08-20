import React from 'react'
import GitHubIcon from '@material-ui/icons/GitHub';
import EmailIcon from '@material-ui/icons/Email';


export default class Footer extends React.Component<object, object> {
  render() {
    return (
      <div className="footer">
        <GitHubIcon/>
        <EmailIcon id="email-icon"/>
      </div>
    )
  }
}
