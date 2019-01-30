import React from 'react'

import './index.css';

import logo from './favicon.ico'

import Form from "./components/Form";
import Log from "./components/Log";
import InstallPrompt from './components/InstallPrompt'
import InfoBar from './components/InfoBar'

import {MuiThemeProvider} from '@material-ui/core/styles'
import Themes from './Themes'
import CssBaseline from '@material-ui/core/CssBaseline';

import Typography from '@material-ui/core/Typography'
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import JoinIcon from '@material-ui/icons/Send'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import PinIcon from '@material-ui/icons/PinDrop'

export default class extends React.Component{
  state = { hash: window.location.hash, theme: localStorage.getItem('theme') || "light" }
  componentDidMount(){ window.app = this }
  switchTheme = () => {
    const theme = (this.state.theme==='light')?'dark':'light'
    this.setState({theme})
    localStorage.setItem('theme', theme)
  }
  handleJoin = () => {
    const input = document.getElementById('channelInput')
    window.location.hash = '#'+input.value
  }
  render(){
    return <MuiThemeProvider theme={Themes[this.state.theme]}>
      <CssBaseline/>
      {(this.state.hash) ? (<>
        <InfoBar switchTheme={this.switchTheme}/>
        <Form />
        <Log />
      </>):(<>
        <Toolbar style={{justifyContent: 'flex-end'}}>
          {(window.ipfs) && (
            <IconButton 
              onClick={async () => {
                const api = await window.ipfs.enable()
                api.pin.add('QmTgbepCJdFFEBjUcCmLD7FM76oKkPWBbEGidsXswMqea3')
                  alert('Vous avez épinglé cette application à votre noeud IPFS')
              }}
              children={<PinIcon/>}  
            />
          )}
        </Toolbar>
        <List style={{ width: '90%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
          <ListItem style={{justifyContent: 'center'}} >
            <img src={logo} />
          </ListItem>
          <ListItem style={{justifyContent: 'center'}}>
            <Typography style={{ textAlign: 'center'}} variant="h2" children={"Oubliez les IRC et les forums"}/>
          </ListItem>
          <ListItem style={{justifyContent: 'center'}}>
            <Typography style={{ textAlign: 'center' }} variant="h6" 
              children={"Parlez avec vos amis ou avec des inconnus, sans intermédiaire, sans installation, et sans inscription"} 
            />
          </ListItem>
          <ListItem style={{justifyContent: 'center'}} >
            <TextField 
              id="channelInput"
              style={{flex: 1, maxWidth: 300}}
              label="Rejoindre le canal"
              defaultValue="main"
              onClick={(ev) => ev.target.select()}
              onKeyPress={(ev) => (ev.key==='Enter') && this.handleJoin()}
              InputProps={{
                startAdornment: <InputAdornment position="start">#</InputAdornment>
              }}
            />
            <IconButton 
              onClick={this.handleJoin}
              children={<JoinIcon/>}
            />
          </ListItem>
        </List>
      </>)}
      <InstallPrompt/>
    </MuiThemeProvider>
  }
}


