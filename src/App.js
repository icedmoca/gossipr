import React from 'react'
import ReactDOM from 'react-dom';

import './index.css';

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import AvatarIcon from "@material-ui/icons/Person";
import Linkify from "react-linkify";
import InputBase from '@material-ui/core/InputBase'
import Holdable from 'react-holdable'
import IconButton from '@material-ui/core/IconButton'
import ThemeIcon from '@material-ui/icons/InvertColors'

import Form from "./components/Form";
import Log from "./components/Log";
import InstallPrompt from './components/InstallPrompt'

import {MuiThemeProvider} from '@material-ui/core/styles'
import Themes from './themes/Themes'
import CssBaseline from '@material-ui/core/CssBaseline';

import { upload, dataURL } from './index'

export default class extends React.Component{
  state = { theme: localStorage.getItem('theme') || "light" }
  switchTheme = () => {
    const theme = (this.state.theme==='light')?'dark':'light'
    this.setState({theme})
    localStorage.setItem('theme', theme)
  }
  render(){
    return <MuiThemeProvider theme={Themes[this.state.theme]}>
      <CssBaseline/>
      <Infos switchTheme={this.switchTheme}/>
      <Form />
      <Log />
      <InstallPrompt/>
    </MuiThemeProvider>
  }
}

class Infos extends React.Component{
  state = {peers: 0, avatar: localStorage.getItem('avatar') }
  componentDidMount(){ window.appBar = this } 
  handleAvatarUpload = (ev) => {
    const file = ev.target.files[0]
    ev.target.value = ""
    
    dataURL(file, (avatar) => {
      this.setState({avatar})
      localStorage.setItem('avatar', avatar)
    })
    upload(file, (hash) => {
      localStorage.setItem('avatar-hash', hash)
    })
  }
  handleAvatarClick = () => {
    if(this.state.avatar) this.handleAvatarDelete()
    else document.getElementById('avatarUploader').click()
  }
  handleAvatarDelete = () => {
    this.setState({avatar: null})
    localStorage.removeItem('avatar')
    localStorage.removeItem('avatar-hash')
  }
  render(){
    return <AppBar 
      position="static">
      <Toolbar style={{padding: '0 10px'}}  >
        <input 
          id='avatarUploader' 
          type='file' 
          accept="image/*" 
          style={{display: 'none'}}
          onChange={this.handleAvatarUpload}
        />
        <Avatar
          onClick={this.handleAvatarClick}
          src={this.state.avatar}
          style={{width: 36, height: 36, marginRight: 10}}
          children={<AvatarIcon/>}
        />
        <InputBase 
          style={{color: 'white', fontWeight: 'bold', fontSize: '20px', flex: 1, marginRight: 20}}
          defaultValue={localStorage.getItem('name') || "Gossipr"}
          onChange={ev => { localStorage.setItem('name', ev.target.value) }}
          onFocus={ev => ev.target.select()}
        />
        <Typography color="inherit" variant="h6">
          {this.state.peers+" connecté(s)"}
        </Typography>
        <IconButton 
          style={{width: 36, height: 36, padding: 0, marginLeft: 10}}
          color='inherit' 
          onClick={this.props.switchTheme}
          children={<ThemeIcon/>}
        />
      </Toolbar>
    </AppBar>
  }
}

