import React from 'react'

import '../index.css';

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import AvatarIcon from "@material-ui/icons/Person";
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import ThemeIcon from '@material-ui/icons/InvertColors'
import ClearAllIcon from '@material-ui/icons/ClearAll'
import CloseIcon from '@material-ui/icons/Clear'
import MenuIcon from '@material-ui/icons/MoreVert'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ShareIcon from '@material-ui/icons/Share'
import SaveIcon from '@material-ui/icons/Save'

import * as Messenger from '/src/Messenger'
import Data from '/src/Data'

export default class extends React.Component{
  state = {peers: 0, avatar: null, menuAnchor: null }
  componentDidMount(){ window.appBar = this } 
  
  handleAvatarUpload = async (ev) => {
    const file = ev.target.files[0]
    ev.target.value = ""
    Messenger.sendAvatar(file)
  }
  handleAvatarDelete = () => Data.avatar = ''
  handleAvatarClick = () => {
    if(this.state.avatar) this.handleAvatarDelete()
    else document.getElementById('avatarUploader').click()
  }

  handleShare = async () => {
    const href = window.location.href
    await navigator.clipboard.writeText(href)
    window.app.setState({snackbar: "L'adresse a été copiée"})
  }
  handleSwitchTheme = () => window.app.switchTheme()
  handleClearAll = () => window.logger.clearAll()
  handleTogglePinnedAtTop = () => window.logger.togglePinnedAtTop()

  render(){
    return <AppBar 
      position="sticky">
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
          src={this.state.avatar && '/ipfs/'+this.state.avatar}
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
          children={<MenuIcon/>}
          onClick={(ev) => this.setState({menuAnchor: ev.target})}
         />
        <Menu
          anchorEl={this.state.menuAnchor}
          open={Boolean(this.state.menuAnchor)}
          onClose={() => this.setState({menuAnchor: null})}>
          <MenuItem>
            <ListItemText children={window.location.hash} />
          </MenuItem>
          <MenuItem onClick={this.handleShare}>
            <ListItemIcon children={<ShareIcon />} />
            <ListItemText children='Partager ce canal' />
          </MenuItem>
          <MenuItem onClick={this.handleSwitchTheme}>
            <ListItemIcon children={<ThemeIcon/>} />
            <ListItemText children='Changer de thème' />
          </MenuItem>
          <MenuItem onClick={this.handleTogglePinnedAtTop}>
            <ListItemIcon children={<SaveIcon/>}/>
            <ListItemText children='Épinglés en haut'/>
          </MenuItem>
          <MenuItem onClick={this.handleClearAll}>
            <ListItemIcon children={<ClearAllIcon />} />
            <ListItemText children='Tout effacer' />
          </MenuItem>
          <MenuItem onClick={() => window.location.hash = ''}>
            <ListItemIcon children={<CloseIcon/>} />
            <ListItemText children='Quitter ce canal' />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  }
}