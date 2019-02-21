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

import Anchor from './Anchor'
import Image from './Image'

import Remark from 'remark'
import RemarkReact from 'remark-react'
import RemarkImages from 'remark-images'
import RemarkBreaks from 'remark-breaks'

import Data from '../Data'
import Node from '../Node'

const Paragraph = ({children}) => <div children={children} style={{marginBlockStart: '1em'}}/>
const Blockquote = ({children}) => 
  <blockquote children={children} 
    style={{ background: '#8080801f', paddingLeft: 10, marginInlineStart: 0, marginInlineEnd: 0}}
  />

export default class extends React.Component {
  state = { menuAnchor: null, clickedMessage: null, pinnedAtTop: Data.pinnedAtTop };
  componentDidMount() { window.logger = this }

  handleBlock = () => {
    const peer = this.state.clickedMessage.peer
    let blocked = Data.blocked;
    blocked.push(peer);
    Data.blocked = blocked
    this.state.menuAnchor = null
    window.app.snackbar('Cet utilisateur a été bloqué')
  }

  handleMessageClick = (ev, msg) => this.setState({ menuAnchor: ev.target, clickedMessage: msg })
  handleQuote = () => {
    window.form.handleQuote(this.state.clickedMessage)
    this.setState({ menuAnchor: null })
  }

  getAll = () => {
    const channel = Data.channel
    const blocked = Data.blocked
    let messages = Data.messages.filter(it => it.channel === channel)
    this.state.tooltip = !messages.length
    return messages.filter(it => !blocked.includes(it.peer))
  }

  getPinned = () => this.getAll().filter(it => it.pinned)
  getNotPinned = () => this.getAll().filter(it => !it.pinned)
  handlePin = () => {
    const msg = this.state.clickedMessage
    msg.pinned = !msg.pinned
    this.setState({menuAnchor: null});
  }

  renderMessages = (messages) => messages.map((msg) => {
    return <Message msg={msg} key={msg.meta.time || new Date().getTime()} />
  })

  getSnapshotBeforeUpdate(prevProps, prevState){
    return (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 100)
  }

  componentDidUpdate(props, state, snapshot) {
    if (snapshot) this.end.scrollIntoView()
  }

  render() {
    return (<>
        <List style={{ maxWidth: "1000px", margin: "auto", marginBottom: 60 }}>
          {(this.state.pinnedAtTop) ? (<> 
            {this.renderMessages(this.getPinned())}
            {this.renderMessages(this.getNotPinned())}
          </>):(<>
            {this.renderMessages(this.getAll())}
          </>)}
        </List>
        <div style={{ float: "left", clear: "both" }} ref={it => this.end = it }/>
        {(this.state.tooltip) && (
          <div style={{paddingLeft: 16, paddingRight: 16, textAlign: 'center'}}>
            <Typography variant='h5' children={'Bienvenue sur le canal ' + Data.channel}/>
            <Typography variant='subtitle1' children={'Commencez par envoyer un message 😉'} />
            <Typography variant='subtitle1' children={'(ou bien restez muet 🙊)'} />
          </div>
        )}
        <Menu
          disableAutoFocusItem
          anchorEl={this.state.menuAnchor}
          open={Boolean(this.state.menuAnchor)}
          onClose={() => this.setState({ menuAnchor: null })}
        >
          <MenuItem onClick={this.handleQuote}>
            <ListItemIcon children={<QuoteIcon/>} />
            <ListItemText inset primary="Citer" />
          </MenuItem>
          <MenuItem onClick={this.handlePin}>
            <ListItemIcon children={<SaveIcon/>} />
            <ListItemText inset primary={(this.state.clickedMessage && this.state.clickedMessage.pinned)?'Désépingler':"Épingler"} />
          </MenuItem>
          {(this.state.clickedMessage) && (this.state.clickedMessage.peer !== window.data.id) && (
            <MenuItem onClick={this.handleBlock}>
              <ListItemIcon children={<BlockIcon />} />
              <ListItemText inset primary="Bloquer" />
            </MenuItem>
          )}
        </Menu>
      </>
    );
  }
}

const Message = ({msg}) => <ListItem  
  style={{alignItems: 'flex-end', background: (msg.pinned)?'#8080801f':null}}>
  <Avatar
    style={{ background: (Data.theme !== 'light') ? 'white' : null }}
    src={Node.getAvatar(msg.meta.avatar)}
    children={<AvatarIcon />}
    onClick={(ev) => window.logger.handleMessageClick(ev, msg)}
  />
  <ListItemText
    primaryTypographyProps={{style:{marginTop: '-1em'}}}
    primary={
      Remark()
        .use(RemarkReact, { remarkReactComponents: { a: Anchor, img: Image, p: Paragraph, blockquote: Blockquote } })
        .use(RemarkBreaks)
        .use(RemarkImages)
        .processSync(msg.data).contents
    }
    secondary={<>
      <span>{Node.getName(msg.peer) || ("~" + msg.meta.name)}</span>
      <span style={{ float: "right" }}>
        {date.format(new Date(msg.meta.time), "HH:mm:ss")}
      </span>
    </>}
  />
</ListItem>
