import React from "react";

import copy from "clipboard-copy";
import QRCode from 'qrcode-react'

import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import Hidden from '@material-ui/core/Hidden';

import Avatar from "@material-ui/core/Avatar";
import AvatarIcon from "@material-ui/icons/Person";
import MoreIcon from "@material-ui/icons/MoreVert";
import CloseIcon from "@material-ui/icons/Clear";
import ThemeIcon from "@material-ui/icons/InvertColors";
import ShareIcon from "@material-ui/icons/Share";
import SaveIcon from "@material-ui/icons/Save";
import SettingsIcon from '@material-ui/icons/Settings'
import ClearAllIcon from '@material-ui/icons/ClearAll'
import PeopleIcon from '@material-ui/icons/People'
import JoinIcon from '@material-ui/icons/Send'
import BlockIcon from "@material-ui/icons/Block";
import MuteIcon from '@material-ui/icons/NotificationsOff'
import MultilineIcon from '@material-ui/icons/SubdirectoryArrowLeft'

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import Typography from "@material-ui/core/Typography";

import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment'

import Data from "../Data";
import Node from '../Node'
import * as Messenger from "../Messenger";

export default class extends React.Component {
  state = { open: false };
  componentDidMount() {
    window.drawer = this;
  }

  open = () => this.setState({ open: true });
  close = () => this.setState({ open: false });

  refSettingsMenu = it => (this.settingsMenu = it);
  openSettingsMenu = e => this.settingsMenu.open(e.target);

  changeName = e => (Data.name = e.target.value);

  handleChannelClick = channel => () => {
    Data.channel = channel;
    this.close();
    Node.refreshPeers();
  };

  refChannelMenu = it => (this.channelMenu = it);
  openChannelMenu = channel => e => {
    this.channelMenu.open(e.target, channel);
  };

  renderChannel = channel => {
    return (
      <ListItem
        key={channel}
        style={{ background: Data.channel === channel ? "#8080801f" : null }}>
        <Typography
          children={channel}
          variant="h6"
          style={{ cursor: 'pointer', flex: 1 }}
          onClick={this.handleChannelClick(channel)}
        />
        <Typography variant='h6'>
          {window.data.peers[channel].length}
        </Typography>
        <Typography style={{marginLeft: 5}} variant='h4'>
          <PeopleIcon color='inherit' />
        </Typography>
        <IconButton
          style={{marginLeft: 5}}
          children={<MoreIcon />}
          onClick={this.openChannelMenu(channel)}
        />
      </ListItem>
    );
  };

  refAvatarInput = it => (this.avatarInput = it);
  handleAvatarClick = () => {
    if (Data.avatar) this.handleAvatarDelete();
    else this.avatarInput.click();
  };
  handleAvatarDelete = () => (Data.avatar = "");
  handleAvatarUpload = async ev => {
    const file = ev.target.files[0];
    ev.target.value = "";
    Node.uploadAvatar(file);
  };

  refShareDialog = it => this.shareDialog = it

  refNewChannel = it => this.newChannel = it
  joinNewChannel = () => {
    let channel = this.newChannel.value
    if(!channel) return
    channel = channel.replace(new RegExp(' ', 'g'), '-')
    if(!channel.startsWith('#')) channel = '#'+channel
    window.location.hash = channel
    this.close()
  }

  renderDrawer = () => <>
    <ListItem>
      <input
        ref={this.refAvatarInput}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={this.handleAvatarUpload}
      />
      <Avatar
        style={{background: (Data.theme !== 'light')?'white':null}}
        onClick={this.handleAvatarClick}
        src={window.data.avatars[Data.avatar]}
        children={<AvatarIcon />}
      />
      <InputBase
        defaultValue={Data.name}
        onChange={this.changeName}
        style={{
          fontWeight: "bold",
          fontSize: "20px",
          flex: 1,
          margin: "0 10px"
        }}
      />
      <IconButton
        onClick={this.openSettingsMenu}
        children={<SettingsIcon />}
      />
      <IconButton onClick={this.close} children={<CloseIcon />} />
    </ListItem>
    <Divider />
    <ListItem>
      <TextField
        style={{ flex: 1 }}
        label="Rejoindre le canal"
        inputRef={this.refNewChannel}
        onKeyPress={(ev) => (ev.key === 'Enter') && this.joinNewChannel()}
        helperText="Vous pouvez aussi en créer un nouveau"
        InputProps={{
          startAdornment: <InputAdornment position="start">#</InputAdornment>
        }}
      />
      <IconButton
        onClick={this.joinNewChannel}
        children={<JoinIcon />}
      />
    </ListItem>
    {Object.keys(window.data.peers).map(this.renderChannel)}
  </>

  render() {
    return <>
      <Drawer anchor="right" onClose={this.close} open={this.state.open} children={this.renderDrawer()} />
      <SettingsMenu ref={this.refSettingsMenu} />
      <ChannelMenu ref={this.refChannelMenu} />
      <ShareDialog ref={this.refShareDialog} />
    </>
  }
}

class SettingsMenu extends React.Component {
  state = { anchor: null };
  open = anchor => this.setState({ anchor });
  close = () => this.setState({ anchor: null });
  theme = () => window.app.switchTheme();

  togglePinnedAtTop = () => {
    Data.pinnedAtTop = !Data.pinnedAtTop
    this.close()
  }

  unblockAll = () => {
    Data.blocked = []
    this.close()
    window.app.snackbar('Tout le monde a été débloqué')
  }

  toggleMultiline = () => {
    const result = Data.multiline = !Data.multiline
    window.app.snackbar('Sauts de ligne '+((result)?'activés':'désactivés'))
  }

  render() {
    return <Menu
      disableAutoFocusItem
      anchorEl={this.state.anchor}
      open={Boolean(this.state.anchor)}
      onClose={this.close}>
      <MenuItem onClick={this.theme}>
        <ListItemIcon children={<ThemeIcon />} />
        <ListItemText children="Changer de thème" />
      </MenuItem>
      <MenuItem onClick={this.togglePinnedAtTop}>
        <ListItemIcon children={<SaveIcon/>}/>
        <ListItemText children='Épinglés en haut'/>
      </MenuItem>
      <MenuItem onClick={this.toggleMultiline}>
        <ListItemIcon children={<MultilineIcon/>}/>
        <ListItemText children='Sauts de ligne'/>
      </MenuItem>
      <MenuItem onClick={this.unblockAll}>
        <ListItemIcon children={<BlockIcon/>}/>
        <ListItemText children='Débloquer tout le monde'/>
      </MenuItem>
    </Menu>
  }
}

class ChannelMenu extends React.Component {
  state = { anchor: null, channel: null };
  open = (anchor, channel) => this.setState({ anchor, channel });
  close = () => this.setState({ anchor: null });

  share = () => {
    window.drawer.shareDialog.open(this.state.channel)
    this.close();
  };

  quit = () => {
    if(this.state.channel === Data.channel)
      return window.app.snackbar('Allez dans un autre canal avant de quitter celui-ci')
    Node.unsubscribe(this.state.channel)
    Node.refreshPeers()
    this.clear()
    this.close()
  };

  clear = () => {
    const { channel } = this.state
    Data.messages = Data.messages.filter(it => it.channel !== channel)
  }

  clearAll = () => {
    this.clear()
    window.app.snackbar('Tous les messages ont été effacés')
    this.close()
  }

  mute = () => {
    const {channel} = this.state
    if(Data.muted.includes(channel)){
      Data.muted = Data.muted.filter(it => it !== channel)
      window.app.snackbar("Ce canal n'est plus en sourdine")
    }
    else {
      Data.muted = [channel, ...Data.muted]
      window.app.snackbar("Ce canal est désormais en sourdine")
    }
  }

  render() {
    return <Menu
      disableAutoFocusItem
      anchorEl={this.state.anchor}
      open={Boolean(this.state.anchor)}
      onClose={this.close}>
      <MenuItem onClick={this.share}>
        <ListItemIcon children={<ShareIcon />} />
        <ListItemText children="Partager ce canal" />
      </MenuItem>
      <MenuItem onClick={this.mute}>
        <ListItemIcon children={<MuteIcon />} />
        {(Data.muted.includes(this.state.channel)) ? (
          <ListItemText children="Activer les notifications" />
        ):(
          <ListItemText children="Désactiver les notifications" />
        )}
      </MenuItem>
      <MenuItem onClick={this.clearAll}>
        <ListItemIcon children={<ClearAllIcon />} />
        <ListItemText children='Tout effacer' />
      </MenuItem>
      <MenuItem onClick={this.quit}>
        <ListItemIcon children={<CloseIcon />} />
        <ListItemText children="Quitter ce canal" />
      </MenuItem>
    </Menu>
  }
}

class ShareDialog extends React.Component{
  state={open: false, channel: null}
  open = (channel) => this.setState({open: true, channel})
  close = () => this.setState({open: false})
  
  href = () => {
    const href = window.location.href.split("#")[0];
    return href + this.state.channel
  }

  copy = () => {
    copy(this.href())
    window.app.snackbar("L'adresse a été copiée")
  }

  share = () => navigator.share({
    title: document.title,
    text: 'Viens discuter avec moi sur '+this.state.channel,
    url: window.location.href,
  })

  render(){
    return <>
      <Dialog 
        fullWidth
        open={this.state.open}
        onClose={this.close}>
        <DialogTitle children={'Amenez du monde sur le canal '+this.state.channel} />
        <DialogContent>
          <List>
            <ListItem style={{ justifyContent: 'center' }}>
              <QRCode size={256} value={this.href()} />
            </ListItem>
            <ListItem style={{justifyContent: 'center'}}>
              <TextField
                defaultValue={this.href()}
                InputProps={{ readOnly: true }}
                style={{ flex: 1 }}
              />
            </ListItem>
            <ListItem style={{justifyContent: 'space-around'}}>
              <Button variant='outlined' onClick={this.copy} children='Copier' />
              {('share' in navigator) && <Button variant='outlined' onClick={this.share} children='Envoyer' />}
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>
    </>
  }
}
