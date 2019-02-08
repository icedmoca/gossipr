import React from 'react'

import './index.css';

import Form from "./components/Form";
import Log from "./components/Log";
import InstallPrompt from './components/InstallPrompt'
import InfoBar from './components/InfoBar'
import Home from './components/Home'

import {MuiThemeProvider} from '@material-ui/core/styles'
import Themes from './Themes'
import CssBaseline from '@material-ui/core/CssBaseline';

import IconButton from '@material-ui/core/IconButton'
import CloseIcon from "@material-ui/icons/Clear";
import Snackbar from "@material-ui/core/Snackbar";

import Data from './Data'

export default class extends React.Component{
  state = { 
    theme: Data.theme, 
    snackbar: null
  }
  snackbar = (message) => this.setState({ snackbar: message })
  componentDidMount(){ window.app = this }
  switchTheme = () => {
    const theme = (this.state.theme==='light')?'dark':'light'
    this.setState({theme})
    localStorage.setItem('theme', theme)
  }
  handleSnackbarClose = () => this.setState({ snackbar: null })
  render(){
    return <MuiThemeProvider theme={Themes[this.state.theme]}>
      <CssBaseline/>
      {(window.location.hash) ? (<>
        <InfoBar/>
        <Log />
        <Form />
      </>):(
        <Home/>
      )}
      <Snackbar
        color="inherit"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={Boolean(this.state.snackbar)}
        autoHideDuration={6000}
        onClose={this.handleSnackbarClose}
        message={this.state.snackbar}
        action={[
          <IconButton
            key="close"
            color="inherit"
            onClick={this.handleSnackbarClose}
            children={<CloseIcon />}
          />
        ]}
      />
      <InstallPrompt/>
    </MuiThemeProvider>
  }
}


