import React from 'react'
import GitHubIcon from '@material-ui/icons/GitHub';
import EmailIcon from '@material-ui/icons/Email';


const Busuanzi = () => {
  const isHome = window.location.href.endsWith('#/')
  if (isHome) {
    return (
      <div className="busuanzi">
        <span id="busuanzi_container_site_pv"> 本站总访问量<span id="busuanzi_value_site_pv"></span>次 </span>
      </div>
    )
  } else {
    return (
      <></>
    )
  }
}


export default class Footer extends React.Component<object, object> {
  render() {
    return (
      <div className="footer">
        <div className="container">
          <a href="https://github.com/AniNet-Project">
            <GitHubIcon/>
          </a>
          <a href="mailto:nanguage@yahoo.com">
            <EmailIcon id="email-icon"/>
          </a>

          <Busuanzi/>
        </div>
      </div>
    )
  }
}
