import React, {Component} from "react";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


type CommentsProps = {
  issueTerm: string,
}

/**
 * Reference:
 *   + https://github.com/utterance/utterances/issues/161
 *   + https://material-ui.com/zh/components/accordion/
 */
export default class Comments extends Component<CommentsProps, {}> {

  componentDidMount () {
      let script = document.createElement("script");
      let anchor = document.getElementById("inject-comments-for-uterances");
      if (anchor !== null) {
        script.setAttribute("src", "https://utteranc.es/client.js");
        script.setAttribute("crossorigin", "anonymous");
        script.setAttribute("async", "true");
        script.setAttribute("repo", "AniNet-Project/aninet-project.github.io");
        script.setAttribute("issue-term", this.props.issueTerm);
        script.setAttribute( "theme", "github-light");
        anchor.appendChild(script);
      }
  }

  render() {
    return (
        <>
          <div className="comments">

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
            >
              <Typography>评论区</Typography>
            </AccordionSummary>
            <AccordionDetails id="comments-content">
              <div id="inject-comments-for-uterances"></div>
            </AccordionDetails>
          </Accordion>

          </div>
        </>
    );
  }
}
