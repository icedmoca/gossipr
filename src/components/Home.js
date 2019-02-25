import React from 'react'

import '../index.css';

import logo from '../favicon.ico'

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

import Data from '../Data'
import Lang from '../Lang'

export default class extends React.Component {
  componentDidMount(){ window.home = this }
  
  handleJoin = () => {
    let channel = this.input.value
    if(!channel) return
    channel = channel.replace(new RegExp(' ', 'g'), '-')
    if(!channel.startsWith('#')) channel = '#'+channel
    Data.newfag = false
    window.location.hash = channel
    window.app.setState({})
  }

  refPinDialog = (it) => this.pinDialog = it
  handlePinDialogOpen = () => this.pinDialog.handleOpen()

  render(){
    return (<>
      <AppBar position="relative"  style={{ background: 'transparent', boxShadow: 'none'}}>
          <Toolbar style={{justifyContent: 'flex-end'}}>
            <IconButton 
              onClick={this.handlePinDialogOpen}
              children={<PinIcon/>}  
            />
            <PinDialog ref={this.refPinDialog}/>
          </Toolbar>
        </AppBar>
        <List style={{ width: '90%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
          <ListItem style={{justifyContent: 'center'}} >
            <img src={logo} />
          </ListItem>
          <ListItem style={{justifyContent: 'center'}}>
            <Typography style={{ textAlign: 'center'}} variant="h3" children={Lang().home_page.title}/>
          </ListItem>
          <ListItem style={{justifyContent: 'center'}}>
            <Typography style={{ textAlign: 'center' }} variant="h6" 
              children={Lang().home_page.text} 
            />
          </ListItem>
          <ListItem style={{justifyContent: 'center'}} >
            <TextField 
              id="channelInput"
              style={{flex: 1, maxWidth: 300}}
              label={Lang().join_channel}
              defaultValue={Data.channel.substr(1) || 'main'}
              inputRef={(it) => this.input = it}
              onKeyPress={(e) => (e.key === 'Enter') && this.handleJoin()}
              helperText={Lang().join_channel_hint}
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
      </>)
  }
}

class PinDialog extends React.Component{
  state = {open: false}
  handlePin = async () => {
    const api = await window.ipfs.enable()
    api.pin.add('QmTgbepCJdFFEBjUcCmLD7FM76oKkPWBbEGidsXswMqea3')
    this.setState({open: false})
  }
  handleOpen = () => this.setState({open: true})
  handleClose = () => this.setState({open: false})
  handleClickDesktop = () => window.open('https://github.com/ipfs-shipyard/ipfs-desktop/releases', '_blank')
  handleClickExtension = () => window.open('https://github.com/ipfs-shipyard/ipfs-companion#install', '_blank')
  render(){
    return (
      <Dialog
        open={this.state.open}
        onClose={this.handleClose}>
        <DialogTitle children={Lang().pin_dialog.title}/>
        <DialogContent>
          <DialogContentText>
            {Lang().pin_dialog.text1}<br/>{Lang().pin_dialog.text2}
          {(!window.ipfs) && (<>
            <br/><br/>{Lang().pin_dialog.install}<br/>
            <Button style={{ margin: 5}} variant="outlined" children={Lang().pin_dialog.ipfs_node}
            onClick={this.handleClickDesktop} />
            <Button style={{ margin: 5}} variant="outlined" children={Lang().pin_dialog.browser_addon}
            onClick={this.handleClickExtension} />
          </>)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button children={Lang().close} onClick={this.handleClose}  />
          {(window.ipfs) && (<Button children={Lang().pin_dialog.pin} onClick={this.handlePin} />)}
        </DialogActions>
      </Dialog>
    )
  }
}