import React from "react";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import AvatarIcon from "@material-ui/icons/Person";
import date from "date-and-time";
import BlockIcon from "@material-ui/icons/Block";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Clear";
import Snackbar from "@material-ui/core/Snackbar";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import QuoteIcon from '@material-ui/icons/FormatQuote'
import CircularProgress from '@material-ui/core/CircularProgress'

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

const Paragraph = ({children}) => <div children={children} style={{marginBlockStart: '1em', marginBlockEnd: '1em'}}/>
const Blockquote = ({children}) => 
  <blockquote children={children} 
    style={{ background: '#8080801f', paddingLeft: 10, marginInlineStart: 0, marginInlineEnd: 0}}
  />

export default class extends React.Component {
  state = { messages: [], menuAnchor: null, snackbar: null, peer: null, isBlocked: false, quote: null, name: null };
  componentDidMount() { window.logger = this  }
  clear = () => this.setState({messages: [], snackbar: 'Tous les messages ont été effacés'})
  log = async (peer, { name, data, avatar }) => {
    let img = null;
    if (avatar) {
      const file = await window.node.files.cat(avatar);
      const b64 = file.toString("base64");
      img = "data:image/png;base64," + b64;
    }

    const obj = { peer, name, data, avatar: img, date: new Date() };

    const messages = this.state.messages;
    messages.push(obj);
    this.setState({ messages });
  }
  isBlocked = (peer) => {
    const blocked = json(localStorage.getItem("blocked")) || [];
    return blocked.includes(peer)
  }
  handleBlock = () => {
    let blocked = json(localStorage.getItem("blocked")) || [];
    if(!this.state.isBlocked){
      blocked.push(this.state.peer);
      this.setState({menuAnchor: null, snackbar: "Cet utilisateur a été bloqué"});
    }
    else {
      blocked = blocked.filter(it => it !== this.state.peer)
      this.setState({ menuAnchor: null, snackbar: "Cet utilisateur a été débloqué" });
    }
    localStorage.setItem("blocked", str(blocked));
  };
  handleQuote = () => {
    const foot = "> ~"+this.state.name+"\n\n"
    const quote = "> "+this.state.quote.replace(new RegExp('\n', 'g'), '\n> ')+"\n"
    window.form.setState({ writing: true, record: null })
    setTimeout(() => {
      window.form.getInput().value += quote + foot
      window.form.getInput().style.height = "190px"
      this.setState({ menuAnchor: null })
    }, 100)
  }
  render() {
    return (
      <>
        <List style={{ maxWidth: "1000px", margin: "auto" }}>
          {[...this.state.messages].reverse().map((v) => (
            <ListItem key={-v.date.getTime()} style={{alignItems: 'flex-end'}}>
              <Avatar
                src={v.avatar}
                children={<AvatarIcon />}
                onClick={ev => 
                  this.setState({ menuAnchor: ev.target, peer: v.peer, isBlocked: this.isBlocked(v.peer), quote: v.data, name: v.name })
                }
              />
              <ListItemText
                primaryTypographyProps={{style:{margin: '-1em 0'}}}
                primary={
                  Remark()
                    .use(RemarkReact, { remarkReactComponents: { a: Anchor, img: Image, p: Paragraph, blockquote: Blockquote } })
                    .use(RemarkBreaks)
                    .use(RemarkImages)
                    .processSync(v.data).contents
                }
                secondary={
                  <>
                    <span>{"~" + v.name}</span>
                    <span style={{ float: "right" }}>
                      {date.format(v.date, "HH:mm:ss")}
                    </span>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
        <Menu
          anchorEl={this.state.menuAnchor}
          open={Boolean(this.state.menuAnchor)}
          onClose={() => this.setState({ menuAnchor: null })}
        >
          <MenuItem onClick={this.handleQuote}>
            <ListItemIcon children={<QuoteIcon/>} />
            <ListItemText inset primary="Citer" />
          </MenuItem>
          {(this.state.peer !== window.id) && (
            <MenuItem onClick={this.handleBlock}>
              <ListItemIcon children={<BlockIcon />} />
              <ListItemText inset primary={(this.state.isBlocked)?"Débloquer":"Bloquer"} />
            </MenuItem>
          )}
        </Menu>
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
      </>
    );
  }
}
