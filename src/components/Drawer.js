import React from "react";

import copy from "clipboard-copy";
import { QRCode } from 'react-qr-svg'

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
import CheckIcon from '@material-ui/icons/Check'
import HomeIcon from '@material-ui/icons/Home'
import EarthIcon from '@material-ui/icons/Public'

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
import CircularProgress from '@material-ui/core/CircularProgress'

import Data from "../Data";
import Node from '../Node'
import * as Ether from '../Ether'
import * as Names from '../contracts/Names'
import * as TopChannels from '../contracts/TopChannels'
import Lang from '../Lang'

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

  handleChannelClick = channel => (e) => {
    Data.channel = channel;
    this.close();
    Node.refreshPeers();
  };

  refChannelMenu = it => (this.channelMenu = it);
  openChannelMenu = channel => e => {
    e.preventDefault()
    this.channelMenu.open({x: e.pageX, y: e.pageY}, channel)
  };

  renderChannel = channel => {
    const theme = window.app.getTheme()
    return (
      <ListItem
        key={channel}
        style={{ background: Data.channel === channel ? window.app.getTheme().palette.secondary.main : null }}
        onContextMenu={this.openChannelMenu(channel)}>
        <Typography
          children={channel}
          variant="h6"
          style={{ 
            width: 0, cursor: 'pointer', flex: 1, marginRight: 20,
            textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' 
          }}
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
  refBuyNameDialog = it => this.buyNameDialog = it
  refPromoteChannelDialog = it => this.promoteChannelDialog = it

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
    <List>
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
          defaultValue={Node.getName(window.data.id) || Data.name}
          onChange={this.changeName}
          disabled={Boolean(Node.getName(window.data.id))}
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
          label={Lang().join_channel}
          inputRef={this.refNewChannel}
          onKeyPress={(ev) => (ev.key === 'Enter') && this.joinNewChannel()}
          helperText={Lang().join_channel_hint}
          InputProps={{
            startAdornment: <InputAdornment position="start">#</InputAdornment>
          }}
        />
        <IconButton
          onClick={this.joinNewChannel}
          children={<JoinIcon />}
        />
      </ListItem>
    </List> 
    <List className='noscrollbar' style={{overflowY: 'scroll'}}>
      {Object.keys(window.data.peers).map(this.renderChannel)}
    </List> 
  </>

  render() {
    return <>
      <Drawer anchor="right" onClose={this.close} open={this.state.open} children={this.renderDrawer()} />
      <SettingsMenu ref={this.refSettingsMenu} />
      <ChannelMenu ref={this.refChannelMenu} />
      <ShareDialog ref={this.refShareDialog} />
      <BuyNameDialog ref={this.refBuyNameDialog} />
      <PromoteChannelDialog ref={this.refPromoteChannelDialog} />
    </>
  }
}

class SettingsMenu extends React.Component {
  state = { anchor: null };
  open = anchor => this.setState({ anchor });
  close = () => this.setState({ anchor: null });
  theme = () => window.app.switchTheme();

  togglePinnedAtTop = () => {
    const result = Data.pinnedAtTop = !Data.pinnedAtTop
    window.app.snackbar(Lang().settings_menu.pinned_at_top_toggled(result))
  }

  unblockAll = () => {
    Data.blocked = []
    window.app.snackbar(Lang().settings_menu.unblocked_all)
  }

  toggleMultiline = () => {
    const result = Data.multiline = !Data.multiline
    window.app.snackbar(Lang().settings_menu.multiline_toggled(result))
  }

  buyName = () => {
    window.drawer.buyNameDialog.open()
    this.close();
  }

  render() {
    return <Menu
      disableAutoFocusItem
      anchorEl={this.state.anchor}
      open={Boolean(this.state.anchor)}
      onClose={this.close}>
      <MenuItem onClick={() => window.location.hash = ''}>
        <ListItemIcon children={<HomeIcon/>}/>
        <ListItemText children={Lang().settings_menu.go_home}/>
      </MenuItem>
      <MenuItem onClick={this.buyName}>
        <ListItemIcon children={<CheckIcon/>}/>
        <ListItemText children={Lang().settings_menu.check_my_name}/>
      </MenuItem>
      <Divider/>
      <MenuItem onClick={this.theme}>
        <ListItemIcon children={<ThemeIcon />} />
        <ListItemText children={Lang().settings_menu.switch_theme} />
      </MenuItem>
      <MenuItem onClick={this.togglePinnedAtTop}>
        <ListItemIcon children={<SaveIcon/>}/>
        <ListItemText children={Lang().settings_menu.pinned_at_top}/>
      </MenuItem>
      <MenuItem onClick={this.toggleMultiline}>
        <ListItemIcon children={<MultilineIcon/>}/>
        <ListItemText children={Lang().settings_menu.multiline(Data.multiline)}/>
      </MenuItem>
      <Divider/>
      <MenuItem onClick={this.unblockAll}>
        <ListItemIcon children={<BlockIcon/>}/>
        <ListItemText children={Lang().settings_menu.unblock_all}/>
      </MenuItem>
    </Menu>
  }
}

class ChannelMenu extends React.Component {
  state = { anchor: null, channel: null };
  open = (pos, channel) => this.setState({ pos, channel });
  close = () => this.setState({ pos: null });

  share = () => {
    window.drawer.shareDialog.open(this.state.channel)
    this.close();
  };

  quit = () => {
    if(this.state.channel === Data.channel)
      return window.app.snackbar(Lang().channel_menu.quit_switch_before)
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
    window.app.snackbar(Lang().channel_menu.cleared_all)
    this.close()
  }

  mute = () => {
    const {channel} = this.state
    if(Data.muted.includes(channel)){
      Data.muted = Data.muted.filter(it => it !== channel)
      window.app.snackbar(Lang().channel_menu.silent_toggled(false))
    }
    else {
      Data.muted = [channel, ...Data.muted]
      window.app.snackbar(Lang().channel_menu.silent_toggled(true))
    }
  }

  promote = () => {
    const {channel} = this.state
    window.drawer.promoteChannelDialog.open(channel)
    this.close()
  }

  render() {
    const {pos} = this.state
    return <>
      <div ref={it => this.anchor = it} style={(pos) && {position: 'absolute', left: pos.x, top: pos.y}}/>
      <Menu
        disableAutoFocusItem
        anchorEl={this.anchor}
        open={Boolean(pos)}
        onClose={this.close}>
        <MenuItem onClick={this.share}>
          <ListItemIcon children={<ShareIcon />} />
          <ListItemText children={Lang().channel_menu.share} />
        </MenuItem>
        <MenuItem onClick={this.promote}>
          <ListItemIcon children={<EarthIcon />} />
          <ListItemText children={Lang().channel_menu.promote} />
        </MenuItem>
        <MenuItem onClick={this.mute}>
          <ListItemIcon children={<MuteIcon />} />
          {(Data.muted.includes(this.state.channel)) ? (
            <ListItemText children={Lang().channel_menu.silent(true)} />
          ):(
            <ListItemText children={Lang().channel_menu.silent(false)} />
          )}
        </MenuItem>
        <MenuItem onClick={this.clearAll}>
          <ListItemIcon children={<ClearAllIcon />} />
          <ListItemText children={Lang().channel_menu.clear_all} />
        </MenuItem>
        <MenuItem onClick={this.quit}>
          <ListItemIcon children={<CloseIcon />} />
          <ListItemText children={Lang().channel_menu.quit} />
        </MenuItem>
      </Menu>
    </>
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
    window.app.snackbar(Lang().channel_share_dialog.copied)
  }

  share = () => navigator.share({
    title: document.title,
    text: Lang().channel_share_dialog.copy_message(this.state.channel),
    url: window.location.href,
  })

  render(){
    const theme = window.app.getTheme()
    return <>
      <Dialog 
        fullWidth
        open={this.state.open}
        onClose={this.close}>
        <DialogTitle children={Lang().channel_share_dialog.title(this.state.channel)} />
        <DialogContent>
          <List>
            <ListItem style={{ justifyContent: 'center' }}>
              <QRCode 
                bgColor={theme.palette.background.paper}
                fgColor={theme.palette.type === 'dark' ? '#FFFFFF':'#000000'}
                style={{ width: 256 }} 
                value={this.href()} 
              />
            </ListItem>
            <ListItem style={{justifyContent: 'center'}}>
              <TextField
                defaultValue={this.href()}
                InputProps={{ readOnly: true }}
                style={{ flex: 1 }}
              />
            </ListItem>
            <ListItem style={{justifyContent: 'space-around'}}>
              <Button variant='outlined' onClick={this.copy} children={Lang().copy} />
              {('share' in navigator) && <Button variant='outlined' onClick={this.share} children={Lang().send} />}
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>
    </>
  }
}

class BuyNameDialog extends React.Component{
  state={open: false, loading: false, price: "0"}
  componentDidMount() { this.loadPrice() }

  loadPrice = async () => {
    this.state.price = await Names.getPrice()
  }

  open = () => this.setState({open: true})
  close = () => this.setState({open: false, loading: false})

  refNameInput = it => this.nameInput = it

  buy = async () => {
    try{ 
      const name = this.nameInput.value
      if(name.trim() !== name) throw new Error(Lang().check_my_name.err_spaces);
      if(await Names.isUsed(name)) throw new Error(Lang().check_my_name.err_used);

      this.setState({ loading: true })
      await Names.buyName(name) 
      window.app.snackbar(Lang().check_my_name.checked)
      Data.name = await Node.loadName(window.data.id)
      this.setState({ open: false, loading: false })
      window.drawer.close()
    }
    catch(ex){ 
      window.app.snackbar(ex.message) 
      this.setState({loading: false})
    }
  }

  render(){
    const {price} = this.state
    return <>
      <Dialog 
        fullWidth
        open={this.state.open}
        onClose={this.close}>
        <DialogTitle children={Lang().check_my_name.title} />
        <DialogContent>
          <List>
            <ListItem style={{ justifyContent: 'center' }}>
              <Typography children={Lang().check_my_name.text(Ether.getWeb3().utils.fromWei(price, 'finney'))}/>
            </ListItem>
            <ListItem style={{justifyContent: 'center'}}>
              <TextField 
                label={Lang().check_my_name.my_name}
                inputRef={this.refNameInput}
                defaultValue={Data.name} 
              />
            </ListItem>
            <ListItem style={{justifyContent: 'space-around'}}>{
              (this.state.loading) ? (
                <Typography component='span'>
                  <CircularProgress color='inherit'/>
                </Typography>
              ) : (
                <Button variant='outlined' onClick={this.buy} children={Lang().check_my_name.check} />
              )
            }</ListItem>
          </List>
        </DialogContent>
      </Dialog>
    </>
  }
}

class PromoteChannelDialog extends React.Component {
  state = { open: false, channel: null, loading: false, minimum: "0" }
  componentDidMount() { this.loadMinimum() }

  loadMinimum = async () => {
    this.state.minimum = await Names.getPrice()
  }

  getMinimum = () => Ether.getWeb3().utils.fromWei(this.state.minimum, 'finney')

  open = (channel) => this.setState({ open: true, channel })
  close = () => this.setState({ open: false, loading: false })

  refNameInput = it => this.nameInput = it

  buy = async () => {
    try {
      const {channel, minimum} = this.state
      this.setState({ loading: true })
      await TopChannels.add(channel, minimum)
      window.app.snackbar(Lang().promote_channel.promoted)
      this.setState({ open: false, loading: false })
    }
    catch (ex) {
      window.app.snackbar(ex.message)
      this.setState({ loading: false })
    }
  }

  render() {
    const { channel } = this.state
    return <>
      <Dialog
        fullWidth
        open={this.state.open}
        onClose={this.close}>
        <DialogTitle children={Lang().promote_channel.title(channel)} />
        <DialogContent>
          <List>
            <ListItem style={{ justifyContent: 'center' }}>
              <Typography children={Lang().promote_channel.text(channel, this.getMinimum())} />
            </ListItem>
            <ListItem style={{ justifyContent: 'space-around' }}>{
              (this.state.loading) ? (
                <Typography component='span'>
                  <CircularProgress color='inherit' />
                </Typography>
              ) : (
                <Button variant='outlined' onClick={this.buy} children={Lang().promote_channel.promote} />
              )
            }</ListItem>
          </List>
        </DialogContent>
      </Dialog>
    </>
  }
}
