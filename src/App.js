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

import Toolbar from '@material-ui/core/Toolbar'
import PinIcon from '@material-ui/icons/PinDrop'

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button'
import AppBar from '@material-ui/core/AppBar'
import CloseIcon from "@material-ui/icons/Clear";
import Snackbar from "@material-ui/core/Snackbar";

import {json} from './index'

export default class extends React.Component{
  lastHash = () => {
    const hashes = json(localStorage.getItem('hashes'))
    return hashes ? hashes[0].substr(1) : 'main'
  }
  state = { 
    hash: window.location.hash, 
    lastHash: this.lastHash(), 
    theme: localStorage.getItem('theme') || "light", 
    pindialog: false,
    snackbar: null
  }
  componentDidMount(){ window.app = this }
  switchTheme = () => {
    const theme = (this.state.theme==='light')?'dark':'light'
    this.setState({theme})
    localStorage.setItem('theme', theme)
  }
  handleJoin = () => window.location.hash = '#'+this.input.value
  handlePin = async () => {
    const api = await window.ipfs.enable()
    api.pin.add('QmTgbepCJdFFEBjUcCmLD7FM76oKkPWBbEGidsXswMqea3')
    this.setState({pindialog: false})
  }

  takePicture = () => {
    const picture = this.webcam.getScreenshot()
    console.log(picture)
    this.setState({picture})
  }
  changeFacing = () => {
    const facing = this.state.facing
    this.setState({facing: (facing==='user')?({exact: "environment"}):('user')})
  }
  render(){
    return <MuiThemeProvider theme={Themes[this.state.theme]}>
      <CssBaseline/>
      {(this.state.hash) ? (<>
        <InfoBar switchTheme={this.switchTheme}/>
        <Log />
        <Form />
      </>):(<>
        <AppBar position="relative"  style={{ background: 'transparent', boxShadow: 'none'}}>
          <Toolbar style={{justifyContent: 'flex-end'}}>
            <IconButton 
              onClick={() => this.setState({pindialog: true})}
              children={<PinIcon/>}  
            />
            <Dialog
              open={this.state.pindialog}
              onClose={() => this.setState({pindialog: false})}>
              <DialogTitle children="Devenez un fournisseur"/>
              <DialogContent>
                <DialogContentText>
                  L'application est stockée sur un réseau de pair-à-pair nommé IPFS.<br/>
                  Stockez l'application sur votre ordinateur, et permettez aux personnes proche de chez vous d'y accéder plus rapidement.
                {(!window.ipfs) && (<>
                  <br/><br/>Vous avez besoin d'installer un noeud IPFS sur votre ordinateur:<br/>
                  <Button style={{ margin: 5}} variant="outlined" children='Noeud IPFS' 
                  onClick={() => window.open('https://github.com/ipfs-shipyard/ipfs-desktop/releases', '_blank')} />
                  <Button style={{ margin: 5}} variant="outlined" children='Extension pour navigateur' 
                  onClick={() => window.open('https://github.com/ipfs-shipyard/ipfs-companion#install', '_blank')} />
                </>)}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button children='Fermer' onClick={() => this.setState({pindialog: false})}  />
                {(window.ipfs) && (<Button children='Épingler' onClick={this.handlePin} />)}
              </DialogActions>
            </Dialog>
          </Toolbar>
        </AppBar>
        <List style={{ width: '90%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
          <ListItem style={{justifyContent: 'center'}} >
            <img src={logo} />
          </ListItem>
          <ListItem style={{justifyContent: 'center'}}>
            <Typography style={{ textAlign: 'center'}} variant="h3" children={"Oubliez les IRC et les forums"}/>
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
              defaultValue={this.state.lastHash}
              inputRef={(it) => this.input = it}
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
      <Snackbar
        color="inherit"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={Boolean(this.state.snackbar)}
        autoHideDuration={6000}
        onClose={() => this.setState({ snackbar: null })}
        message={this.state.snackbar}
        action={[
          <IconButton
            key="close"
            color="inherit"
            onClick={() => this.setState({ snackbar: null })}
            children={<CloseIcon />}
          />
        ]}
      />
      <InstallPrompt/>
    </MuiThemeProvider>
  }
}


