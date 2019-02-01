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
import CircularProgress from '@material-ui/core/CircularProgress'
import SaveIcon from '@material-ui/icons/Save'

import Remark from 'remark'
import RemarkReact from 'remark-react'
import RemarkImages from 'remark-images'
import RemarkBreaks from 'remark-breaks'

import isIPFS from 'is-ipfs'
import fileType from 'file-type'

import { json, str } from "../index";

class Anchor extends React.Component{
  state = { type: 'anchor', blob: null }
  async componentDidMount() {
    const {href} = this.props
    const ipfsPattern = /^https?:\/\/[^/]+\/(ip(f|n)s)\/((\w+).*)/
    const ipfsMatch = href.match(ipfsPattern)
    if(ipfsMatch){
      const hash = ipfsMatch[4]
      if(isIPFS.cid(hash)){
        this.setState({ type: 'loading' })
        const file = await window.node.files.cat(hash)
        const mime = fileType(file)
        const type = mime.mime.split('/')[0]
        if(['audio', 'image', 'video'].includes(type)){
          const b64 = file.toString("base64");
          const blob = "data:"+type+"/"+mime.ext+";base64,"+b64;
          this.setState({ type, blob })
        }
      }
    }
  }
  render(){
    const {href, children} = this.props
    const {type, blob} = this.state
    if(type==="loading")
      return <CircularProgress color='inherit' size={20} />
    if(type==='audio') 
      return <audio 
        controls 
        style={{width: "100%"}}
        children={<source src={blob} />}
      />
    if(type==='image')
      return <Image src={blob} />
    if(type==='video')
      return <video 
        controls
        style={{width: '100%', maxWidth: 500, maxHeight: 500}}
        children={<source src={blob}/>}
      />
    if(children[0].type && children[0].type.name==='Image')
      return <>{children}</>
    return <a href={href} target='_blank' children={children} />
  }
}

class Image extends React.Component {
  state = {big: false}
  render(){
    const {src} = this.props
    return <img src={src} 
      style={{width: '100%', maxWidth: (this.state.big)?500:90}}
      onClick={() => this.setState({big: !this.state.big})}
    />
  }
}

const Paragraph = ({children}) => <div children={children} style={{marginBlockStart: '1em'}}/>
const Blockquote = ({children}) => 
  <blockquote children={children} 
    style={{ background: '#8080801f', paddingLeft: 10, marginInlineStart: 0, marginInlineEnd: 0}}
  />

function union(first, second, compare) {
  var union = first.concat(second);
  for (var i = 0; i < union.length; i++) {
    for (var j = i + 1; j < union.length; j++) {
      if (compare(union[i], union[j])) {
        union.splice(j, 1);
        j--;
      }
    }
  }
  return union;
}

export default class extends React.Component {
  messagesKey = () => 'messages' + window.location.hash
  pinnedKey = () => 'pinned' + window.location.hash
  getPinned = () => json(localStorage.getItem(this.pinnedKey())) || []
  getTemp = () =>  json(localStorage.getItem(this.messagesKey())) || []
  getMessages = () => {
    const messages = union(this.getTemp(), this.getPinned(), (a, b) => a.date === b.date)
    return messages.sort((a,b) => (a.date > b.date)?1:-1)
  }
  state = { messages: this.getMessages(), menuAnchor: null, message: null };
  componentDidMount() { window.logger = this  }
  clear = () => {
    localStorage.setItem('messages'+window.location.hash, str([]))
    this.setState({messages: this.getMessages()})
    window.app.setState({snackbar: 'Tous les messages ont été effacés'})
  }
  log = async (peer, { name, data, avatar }) => {
    let img = null;
    if (avatar) {
      const file = await window.node.files.cat(avatar);
      const b64 = file.toString("base64");
      img = "data:image/png;base64," + b64;
    }

    const obj = { peer, name, data, avatar: img, date: (new Date()).getTime() };

    const messages = [...this.getTemp()];
    messages.push(obj);
    localStorage.setItem('messages'+window.location.hash, str(messages))
    this.setState({ messages: this.getMessages() });
  }
  isBlocked = (peer) => {
    const blocked = json(localStorage.getItem("blocked")) || [];
    return blocked.includes(peer)
  }
  handleBlock = () => {
    let blocked = json(localStorage.getItem("blocked")) || [];
    const peer = this.state.message.peer
    if(!blocked.includes(peer)){
      blocked.push(peer);
      this.setState({menuAnchor: null});
      window.app.setState({snackbar: "Cet utilisateur a été bloqué"})
    }
    else {
      blocked = blocked.filter(it => it !== peer)
      this.setState({ menuAnchor: null});
      window.app.setState({snackbar: "Cet utilisateur a été débloqué"})
    }
    localStorage.setItem("blocked", str(blocked));
  };
  handleQuote = () => {
    const foot = "> ~"+this.state.message.name+"\n\n"
    const quote = "> "+this.state.message.data.replace(new RegExp('\n', 'g'), '\n> ')+"\n"
    const value = window.form.state.value + quote + foot
    window.form.setState({ value, record: null })
    this.setState({ menuAnchor: null })
  }
  isPinned = (msg) => str(this.getPinned()).includes(str(msg))
  handlePin = () => {
    let pinned = this.getPinned()
    const msg = this.state.message
    if(!str(pinned).includes(str(msg))){
      pinned.push(msg);
      this.setState({menuAnchor: null});
      window.app.setState({snackbar: "Ce message a été épinglé"})
    }
    else {
      pinned = pinned.filter(it => str(it) !== str(msg))
      this.setState({ menuAnchor: null });
      window.app.setState({snackbar: "Ce message a été désépinglé"})
    }
    localStorage.setItem(this.pinnedKey(), str(pinned));
    this.setState({ messages: this.getMessages() });
  }
  render() {
    return (<>
        <List style={{ maxWidth: "1000px", margin: "auto", marginBottom: 60 }}>
          {[...this.state.messages].reverse().map((msg) => (
            <ListItem key={-msg.date} style={{alignItems: 'flex-end', background: (this.isPinned(msg))?'#8080801f':null}}>
              <Avatar
                src={msg.avatar}
                children={<AvatarIcon />}
                onClick={ev => 
                  this.setState({ menuAnchor: ev.target, message: msg })
                }
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
                secondary={
                  <>
                    <span>{"~" + msg.name}</span>
                    <span style={{ float: "right" }}>
                      {date.format(new Date(msg.date), "HH:mm:ss")}
                    </span>
                  </>
                }
              />
            </ListItem>
          ))}
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
            <ListItemText inset primary={(this.isPinned(this.state.message))?'Désépingler':"Épingler"} />
          </MenuItem>
          {(this.state.message && (this.state.message.peer !== window.id)) && (
            <MenuItem onClick={this.handleBlock}>
              <ListItemIcon children={<BlockIcon />} />
              <ListItemText inset primary={(this.isBlocked(this.state.message.peer))?"Débloquer":"Bloquer"} />
            </MenuItem>
          )}
        </Menu>
      </>
    );
  }
}
