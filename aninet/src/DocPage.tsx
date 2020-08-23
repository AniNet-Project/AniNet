import React from 'react'
import ReactMarkdown from 'react-markdown'

import CodeBlock from "./CodeBlock"
import Header from './Header'
import Footer from './Footer'
import './DocPage.css'


type DocPageProps = {
  title: string,
  sourceUrl: string,
}
type DocPageState = {
  error: null | Error,
  isLoaded: boolean,
  content: string | null,
}


export default class DocPage extends React.Component<DocPageProps, DocPageState> {
  constructor(props: DocPageProps) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      content: null,
    }
  }

  componentDidMount() {
    const url = this.props.sourceUrl
    fetch(url)
      .then(res => res.text())
      .then((data) => {
        this.setState({
          isLoaded: true,
          content: data
        })
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        })
      })
  }

  render() {
    const { error, isLoaded, content } = this.state
    if (error) {
      return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
      return <div>Loading...</div>
    } else {
      return (
        <>
          <Header title={this.props.title}/>
          <div className="container">
            <div className="doc">
              <ReactMarkdown
                source={content as string}
                renderers={{ code: CodeBlock }}
                escapeHtml={false}
              />
            </div>
          </div>
          <Footer/>
        </>
      )
    }
  }

}
