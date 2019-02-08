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

export default class extends React.Component {
  componentDidMount(){ window.home = this }
  handleJoin = () => window.location.hash = '#'+this.input.value
  handleKeyPress = (ev) => (ev.key === 'Enter') && this.handleJoin()
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
              defaultValue={(window.data.channels[0] || '#main').substr(1)}
              inputRef={(it) => this.input = it}
              onKeyPress={this.handleKeyPress}
              helperText="Vous pouvez aussi en créer un nouveau"
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
        <DialogTitle children="Devenez un fournisseur"/>
        <DialogContent>
          <DialogContentText>
            L'application est stockée sur un réseau de pair-à-pair nommé IPFS.<br/>
            Stockez l'application sur votre ordinateur, et permettez aux personnes proche de chez vous d'y accéder plus rapidement.
          {(!window.ipfs) && (<>
            <br/><br/>Vous avez besoin d'installer un noeud IPFS sur votre ordinateur:<br/>
            <Button style={{ margin: 5}} variant="outlined" children='Noeud IPFS' 
            onClick={this.handleClickDesktop} />
            <Button style={{ margin: 5}} variant="outlined" children='Extension pour navigateur' 
                  onClick={this.handleClickExtension} />
          </>)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button children='Fermer' onClick={this.handleClose}  />
          {(window.ipfs) && (<Button children='Épingler' onClick={this.handlePin} />)}
        </DialogActions>
      </Dialog>
    )
  }
}