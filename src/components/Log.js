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

import Anchor from './Anchor'
import Image from './Image'

import Remark from 'remark'
import RemarkReact from 'remark-react'
import RemarkImages from 'remark-images'
import RemarkBreaks from 'remark-breaks'

import Data from '/src/Data'

const Paragraph = ({children}) => <div children={children} style={{marginBlockStart: '1em'}}/>
const Blockquote = ({children}) => 
  <blockquote children={children} 
    style={{ background: '#8080801f', paddingLeft: 10, marginInlineStart: 0, marginInlineEnd: 0}}
  />

export default class extends React.Component {
  state = { menuAnchor: null, clickedMessage: null, pinnedAtTop: false };
  componentDidMount() { window.logger = this }

  togglePinnedAtTop = () => this.setState({pinnedAtTop: !this.state.pinnedAtTop})
  clearAll = () => {
    window.data.messages = this.getPinned()
    window.app.snackbar('Tous les messages ont été effacés')
  }

  isBlocked = (peer) => Data.blocked.includes(peer)
  handleBlock = () => {
    let blocked = Data.blocked;
    const peer = this.state.clickedMessage.peer
    
    if(blocked.includes(peer))
      blocked = blocked.filter(it => it !== peer)
    else blocked.push(peer);

    Data.blocked = blocked
    this.state.menuAnchor = null
    window.app.snackbar('Cet utilisateur a été '+(blocked.includes(peer)?'bloqué':'débloqué'))
  }

  handleMessageClick = (ev, msg) => this.setState({ menuAnchor: ev.target, clickedMessage: msg })
  handleQuote = () => {
    const foot = "> ~"+this.state.clickedMessage.meta.name+"\n\n"
    const quote = "> "+this.state.clickedMessage.data.replace(new RegExp('\n', 'g'), '\n> ')+"\n"
    const value = window.form.state.value + quote + foot
    window.form.setState({ value, record: null })
    this.setState({ menuAnchor: null })
  }

  getPinned = () => window.data.messages.filter(it => it.pinned)
  getNotPinned = () => window.data.messages.filter(it => !it.pinned)
  handlePin = () => {
    const msg = this.state.clickedMessage
    msg.pinned = !msg.pinned
    this.setState({menuAnchor: null});
  }

  renderMessages = (messages) => [...messages].reverse().map((msg) => {
    return <Message msg={msg} key={-(msg.meta.time || new Date().getTime())} />
  })

  render() {
    return (<>
        <List style={{ maxWidth: "1000px", margin: "auto", marginBottom: 60 }}>
          {(this.state.pinnedAtTop) ? (<> 
            {this.renderMessages(this.getPinned())}
            {this.renderMessages(this.getNotPinned())}
          </>):(<>
            {this.renderMessages(window.data.messages)}
          </>)}
        </List>
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
          {(this.state.clickedMessage && (this.state.clickedMessage.peer !== window.id)) && (
            <MenuItem onClick={this.handleBlock}>
              <ListItemIcon children={<BlockIcon />} />
              <ListItemText inset primary={(this.isBlocked(this.state.clickedMessage.peer))?"Débloquer":"Bloquer"} />
            </MenuItem>
          )}
        </Menu>
      </>
    );
  }
}

const Message = ({msg}) => <ListItem  
  style={{alignItems: 'flex-end', background: (msg.meta.pinned)?'#8080801f':null}}>
  <Avatar
    src={msg.meta.avatar && '/ipfs/' + msg.meta.avatar}
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
      <span>{"~" + msg.meta.name}</span>
      <span style={{ float: "right" }}>
        {date.format(new Date(msg.meta.time), "HH:mm:ss")}
      </span>
    </>}
  />
</ListItem>
