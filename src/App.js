import React from 'react'

import './index.css';

import Form from "./components/Form";
import Log from "./components/Log";
import Home from './components/Home'
import Drawer from './components/Drawer'
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import shareicon from './assets/shareicon.png'

import {MuiThemeProvider} from '@material-ui/core/styles'
import Themes from './Themes'
import CssBaseline from '@material-ui/core/CssBaseline';

import IconButton from '@material-ui/core/IconButton'
import CloseIcon from "@material-ui/icons/Clear";
import Snackbar from "@material-ui/core/Snackbar";
import CircularProgress from '@material-ui/core/CircularProgress'
import { Helmet } from "react-helmet";

import MenuIcon from '@material-ui/icons/Menu'
import PeopleIcon from '@material-ui/icons/People'

import Data from './Data'
import Lang from './Lang'

export default class extends React.Component{
  state = { ready: false, snackbar: null }
  componentDidMount(){ window.app = this }

  snackbar = (message) => this.setState({ snackbar: message })

  getTitle = () => {
    if (!Data.channel) return "Gossipr";
    return Data.channel + " - Gossipr";
  }

  getTheme = () => Themes[Data.theme]

  switchTheme = () => {
    const themes = Object.keys(Themes)
    const i = themes.indexOf(this.state.theme)
    Data.theme = themes[(i + 1) % themes.length]
    this.setState({})
  }

  render(){
    const theme = this.getTheme()
    return <MuiThemeProvider theme={theme}>
      <Helmet>
        <title children={this.getTitle()}/>
        <meta name="theme-color" content={theme.palette.background.default} />
      </Helmet>
      <CssBaseline/>
      {(Data.channel && !Data.newfag) ? (this.state.ready) ? (<App/>) : (<Loading/>) : (<Home theme={theme}/>)}
      <SimpleSnackbar message={this.state.snackbar} close={() => this.snackbar(null)} />
      <InstallPrompt/>
    </MuiThemeProvider>
  }
}

const App = () => <>
  <InfoBar/>
  <Drawer />
  <Log />
  <Form />
</>

const Loading = () => <>
  <Typography component='span' style={{display: 'flex', justifyContent: 'center'}}>
      <CircularProgress style={{position: 'absolute', top: '40%'}} size={120} color='inherit' />
  </Typography>
</>

const SimpleSnackbar = ({message, close}) => <>
  <Snackbar
    color="inherit"
    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    open={Boolean(message)}
    autoHideDuration={6000}
    onClose={close}
    message={message}
    action={[
      <IconButton
        key="close"
        color="inherit"
        onClick={close}
        children={<CloseIcon />}
      />
    ]}
  />
</>

class InfoBar extends React.Component {
  state = { peers: 0 }
  componentDidMount() { window.appBar = this }

  render() {
    return <AppBar
      color='primary'
      style={{ boxShadow: 'none' }}
      position="sticky">
      <Toolbar style={{ padding: '0 10px', maxWidth: 1000, width: '100%', margin: 'auto' }}  >
        <Typography
          className="ellipsis"
          style={{ flex: 1, marginRight: 20, maxWidth: 1000 }}
          color="inherit"
          variant="h6"
          children={Data.alias(Data.channel)}
        />
        <Typography color="inherit" variant="h6" children={this.state.peers} />
        <PeopleIcon style={{ marginLeft: 5 }} />
        <IconButton
          style={{ width: 36, height: 36, padding: 0, marginLeft: 10 }}
          color='inherit'
          children={<MenuIcon />}
          onClick={() => window.drawer.open()}
        />
      </Toolbar>
    </AppBar>
  }
}

class InstallPrompt extends React.Component {
  isInstalled = (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone);
  isiOS = ['iPhone', 'iPad', 'iPod'].includes(navigator.platform)

  render() {
    if(this.isInstalled) return null;
    if(!this.isiOS) return null;
    return <AppBar
      color='default'
      position='fixed'
      style={{ top: 'auto', bottom: 0 }}>
      <Toolbar
        style={{ justifyContent: 'space-between' }}>
        <img alt="install-icon" src={shareicon} style={{ width: '24px' }} />
        <Typography variant="h7" children={Lang().install_prompt} />
        <CloseIcon onClick={() => this.setState({ active: false })} />
      </Toolbar>
    </AppBar>
  }
}