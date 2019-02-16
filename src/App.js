import React, {useState} from 'react'

import './index.css';

import Form from "./components/Form";
import Log from "./components/Log";
import InstallPrompt from './components/InstallPrompt'
import InfoBar from './components/InfoBar'
import Home from './components/Home'
import Drawer from './components/Drawer'

import {MuiThemeProvider} from '@material-ui/core/styles'
import Themes from './Themes'
import CssBaseline from '@material-ui/core/CssBaseline';

import IconButton from '@material-ui/core/IconButton'
import CloseIcon from "@material-ui/icons/Clear";
import Snackbar from "@material-ui/core/Snackbar";
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import { Helmet } from "react-helmet";

import Data from './Data'

export default class extends React.Component{
  state = { ready: false, theme: Data.theme, snackbar: null }
  componentDidMount(){ window.app = this }

  snackbar = (message) => this.setState({ snackbar: message })
  closeSnackbar = () => this.snackbar(null)

  getTitle = () => {
    if (!window.location.hash) return "Gossipr";
    return window.location.hash + " - Gossipr";
  }

  switchTheme = () => {
    const themes = Object.keys(Themes)
    const i = themes.indexOf(this.state.theme)
    const theme = themes[(i+1)%themes.length]
    this.setState({theme})
    localStorage.setItem('theme', theme)
  }

  render(){
    return <MuiThemeProvider theme={Themes[this.state.theme]}>
      <Helmet>
        <title children={this.getTitle()}/>
        <meta name="theme-color" content={Themes[this.state.theme].palette.background.default} />
      </Helmet>
      <CssBaseline/>
      {(Data.channel && !Data.newfag) ? (this.state.ready) ? (<>
        <InfoBar/>
        <Drawer />
        <Log />
        <Form />
      </>) : (<Typography style={{display: 'flex', justifyContent: 'center'}}>
          <CircularProgress style={{position: 'absolute', top: '40%'}} size={120} color='inherit' />
      </Typography>):(<Home/>)}
      <Snackbar
        color="inherit"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={Boolean(this.state.snackbar)}
        autoHideDuration={6000}
        onClose={this.closeSnackbar}
        message={this.state.snackbar}
        action={[
          <IconButton
            key="close"
            color="inherit"
            onClick={this.closeSnackbar}
            children={<CloseIcon />}
          />
        ]}
      />
      <InstallPrompt/>
    </MuiThemeProvider>
  }
}


