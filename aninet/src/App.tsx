import React from 'react';
import {
  HashRouter as Router,
  Route
} from 'react-router-dom'
import './App.css';
import NetPage from './NetPage'
import Header from './Header'
import Footer from './Footer'
import { NetItem } from './datatypes';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DocPage from './DocPage';

type CardProps = {
  item: NetItem
}

class Card extends React.Component<CardProps, object> {
  render() {
    let item = this.props.item
    return (
      <a href={"#/network/"+item.name}>
      <div className="card">
        <img className="titleImg" src={item.titleImg} alt={item.name}></img>
        <p className="name">{item.name}</p>
      </div>
      </a>
    )
  }
}

class NewCard extends React.Component<CardProps, object> {
  render() {
    let item = this.props.item
    return (
        <div className="card" id="newCard">
          <a href={"#/network/"+item.name}>
            <Tooltip title="新建空白页" placement="top">
              <IconButton type="submit" id="newPageButton" >
                <AddCircleOutlineIcon id="newPageIcon"/>
              </IconButton>
            </Tooltip>
          </a>
        </div>
    )
  }
}

type CardsProps = {
  items: Array<NetItem>
}

class Cards extends React.Component<CardsProps, object> {
  render() {
    const items = this.props.items
    return (
      <div className="cards">
        {items.map(item => (
          (item.name === "新建网络")
          ? <NewCard key={item.name} item={item}/>
          : <Card key={item.name} item={item}/>
        ))}
      </div>
    )
  }
}

type HomeProps = {
  items: Array<NetItem>
}

class Home extends React.Component<HomeProps, object> {
  render() {
    let items = this.props.items
    return (
      <div className="App">
        <Header title="ACG人物关系可视化"/>
        <div className="contents">
          <div className="container">
            <Cards items={items}/>
          </div>
        </div>
        <Footer/>
      </div>
    )
  }
}

type AppProps = {}
type AppState = {
  error: Error | null,
  isLoaded: boolean,
  items: Array<NetItem>
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    }
  }

  componentDidMount() {
    fetch("networks.json")
      .then(res => res.json())
      .then((data) => {
        this.setState({
          isLoaded: true,
          items: data
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
    let { error, isLoaded, items } = this.state
    const emptyItem = {name: "新建网络", titleImg: "", url: "data/empty.json"}
    items = items.concat([emptyItem])
    if (error) {
      return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
      return <div>Loading...</div>
    } else {
      return (
        <Router basename="/">
          <Route key="home" exact path="/" component={() => <Home items={items}/>} />
          {items.map(item => (
            <Route key={item.name} path={"/network/"+item.name}
                   component={() => <NetPage item={item}/>} />
          ))}
          <Route key="contribute" path={"/contribute"}
                 component={() => <DocPage title="如何贡献" sourceUrl={"docs/contribute.md"}/>} />
          <Route key="about" path={"/about"}
                 component={() => <DocPage title="关于" sourceUrl={"docs/about.md"}/>}
                 />
        </Router>
      );
    }
  }
}

export default App;
