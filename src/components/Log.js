import React from "react";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import AvatarIcon from "@material-ui/icons/Person";
import date from "date-and-time";
import BlockIcon from "@material-ui/icons/Block";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import QuoteIcon from '@material-ui/icons/FormatQuote'
import SaveIcon from '@material-ui/icons/Save'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'

import ClearIcon from '@material-ui/icons/Clear'

import Remark from 'remark'
import RemarkReact from 'remark-react'
import RemarkImages from 'remark-images'
import RemarkBreaks from 'remark-breaks'
import fileType from 'file-type'

import Data from '../Data'
import Node from '../Node'

import Lang from '../Lang'

const Paragraph = ({children}) => <>
  <div style={{marginTop: 10}} children={children}/>
</>

const Blockquote = ({children}) => 
  <blockquote children={children} 
    style={{ background: '#8080801f', paddingLeft: 10, marginInlineStart: 0, marginInlineEnd: 0}}
  />

class Image extends React.Component {
  state = { big: false }
  handleClick = () => this.setState({ big: !this.state.big })
  render() {
    const { src } = this.props
    return <img src={src}
      style={{ width: '100%', maxWidth: (this.state.big) ? 500 : 90 }}
      onClick={this.handleClick}
    />
  }
}

export default class extends React.Component {
  state={tooltip: false}
  componentDidMount() { window.logger = this }

  getSnapshotBeforeUpdate(prevProps, prevState){
    return !prevState.tooltip || (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 100)
  }

  componentDidUpdate(props, state, snapshot) {
    if (snapshot) this.end.scrollIntoView()
  }
  
  getAll = () => {
    const channel = Data.channel
    const blocked = Data.blocked
    let messages = Data.messages.filter(it => it.channel === channel)
    this.state.tooltip = !messages.length
    return messages.filter(it => !blocked.includes(it.peer))
  }
  getPinned = () => this.getAll().filter(it => it.pinned)

  renderMessages = (messages) => messages.map(this.renderMessage)
  openMenu = (msg) => (e) => this.messageMenu.open({x: e.pageX, y: e.pageY}, msg)
  renderMessage = (msg) => <ListItem  
    key={msg.meta.time || new Date().getTime()}
    style={{alignItems: 'flex-end', background: (msg.pinned)?'#8080801f':null}}
    onClick={this.openMenu(msg)}>
    <Avatar
      style={{ background: (Data.theme !== 'light') ? 'white' : null }}
      src={Node.getAvatar(msg.meta.avatar)}
      children={<AvatarIcon />}
    />
    <ListItemText
      primaryTypographyProps={{component: 'div', style: {marginTop: -10}}}
      primary={
        Remark()
          .use(RemarkReact, { remarkReactComponents: { a: Anchor, img: Image, p: Paragraph, blockquote: Blockquote } })
          .use(RemarkBreaks)
          .use(RemarkImages)
          .processSync(msg.data).contents
      }
      secondaryTypographyProps={{component: 'span'}}
      secondary={<Grid container justify='space-between' spacing={8}>
        <Grid item zeroMinWidth xs>
          <Typography noWrap>{Node.getName(msg.peer) || ('~'+msg.meta.name)}</Typography>
        </Grid>
        {(!Node.getName(msg.peer)) && <Grid item zeroMinWidth>{'#'+msg.peer.substr(2, 8)}</Grid>}
        <Grid item style={{textAlign: 'end'}}>
          {date.format(new Date(msg.meta.time), "HH:mm:ss")}
        </Grid>
      </Grid>}
    />
  </ListItem>

  render() {
    return <>
      <List style={{ maxWidth: "1000px", margin: "auto", marginBottom: 60 }}>
        {(Data.pinnedAtTop) && this.renderMessages(this.getPinned())}
        {this.renderMessages(this.getAll())}
      </List>
      <div style={{ float: "left", clear: "both" }} ref={it => this.end = it }/>
      {(this.state.tooltip) && (
        <div style={{paddingLeft: 16, paddingRight: 16, textAlign: 'center'}}>
          <Typography variant='h5' children={Lang().welcome_message.title(Data.alias(Data.channel))}/>
          <Typography variant='subtitle1' children={Lang().welcome_message.text1} />
          <Typography variant='subtitle1' children={Lang().welcome_message.text2} />
        </div>
      )}
      <MessageMenu ref={it => this.messageMenu = it} />
    </>
  }
}

class MessageMenu extends React.Component{
  state = { pos: null, message: null }
  
  open = (pos, message) => this.setState({pos, message})
  close = () => this.setState({pos: null, message: null})

  handleBlock = () => {
    const peer = this.state.message.peer
    let blocked = Data.blocked;
    blocked.push(peer);
    Data.blocked = blocked
    this.close()
    window.app.snackbar(Lang().message_menu.blocked)
  }

  handleQuote = () => {
    window.form.handleQuote(this.state.message)
    this.close()
  }

  handlePin = () => {
    const msg = this.state.message
    Data.messages = Data.messages.map(it => (it.hash === msg.hash)?{...it, pinned: !msg.pinned}:it)
    this.close()
    window.logger.setState({})
  }

  handleDelete = () => {
    const msg = this.state.message
    Data.messages = Data.messages.filter(it => it.hash !== msg.hash)
    this.close()
    window.logger.setState({})
  }

  render(){
    const {pos, message} = this.state
    return <>
      <div ref={it => this.anchor = it} style={(pos) && {position: 'absolute', left: pos.x, top: pos.y}}/>
      <Menu
        disableAutoFocusItem
        anchorEl={this.anchor}
        open={Boolean(pos)}
        onClose={this.close}>
        <MenuItem onClick={this.handleQuote}>
          <ListItemIcon children={<QuoteIcon />} />
          <ListItemText inset primary={Lang().message_menu.quote} />
        </MenuItem>
        <MenuItem onClick={this.handlePin}>
          <ListItemIcon children={<SaveIcon />} />
          <ListItemText inset primary={Lang().message_menu.pin(message && message.pinned)} />
        </MenuItem>
        {(message) && (message.peer !== window.data.id) && (
          <MenuItem onClick={this.handleBlock}>
            <ListItemIcon children={<BlockIcon />} />
            <ListItemText inset primary={Lang().message_menu.block} />
          </MenuItem>
        )}
        <MenuItem onClick={this.handleDelete}>
          <ListItemIcon children={<ClearIcon />} />
          <ListItemText inset primary={Lang().message_menu.delete} />
        </MenuItem>
      </Menu>
    </>
  }
}

class Anchor extends React.Component {
  state = { type: 'anchor', source: this.props.href }

  componentDidMount() {
    (async () => {
      const { href } = this.props
      const ipfsPattern = /^https?:\/\/[^/]+\/(ip(f|n)s)\/((\w+).*)/
      const ipfsMatch = href.match(ipfsPattern)
      if(!ipfsMatch) return
      const hash = ipfsMatch[4]

      this.setState({ type: 'loading' })
      const fallback = () => this.setState({type: 'anchor'})

      //const {size} = (await Node.node.files.get(hash))[0]
      //console.log('Received file size', size)
      //if(size > 10000000) return fallback()

      const file = await Node.node.files.cat(hash)

      const {ext, mime} = fileType(file)
      const type = mime.split('/')[0]
      const mimes = ['audio', 'image', 'video']
      if(!mimes.includes(type)) return fallback()

      const source = "data:"+type+"/"+ext+";base64,"+file.toString("base64");
      this.setState({ type, source })
    })()
  }
  render() {
    const { children } = this.props
    const { type, source } = this.state
    if (type === "loading")
      return <CircularProgress color='inherit' size={20} />
    if (type === 'audio')
      return <audio
        controls
        style={{ width: "100%" }}
        children={<source src={source} />}
      />
    if (type === 'image')
      return <Image src={source} />
    if (type === 'video')
      return <video
        controls
        style={{ width: '100%', maxWidth: 500, maxHeight: 500 }}
        children={<source src={source} />}
      />
    if(children[0].type && children[0].type.name === 'Image')
      return <>{children}</>
    return <a href={source} target='_blank' children={children} />
  }
}