import React from "react";
import ReactDOM from "react-dom";

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import AvatarIcon from '@material-ui/icons/Person'
import Linkify from 'react-linkify'
import date from 'date-and-time';
import BlockIcon from '@material-ui/icons/Block'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Clear'
import Snackbar from '@material-ui/core/Snackbar'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'

import {json, str} from '../index'

export default class extends React.Component {
  state = { messages: [], menuAnchor: null, snackbar: null };
  log = async (peer, {type, name, data, avatar}) => {
    let img = null
    if(avatar){
      const file = await window.node.files.cat(avatar)
      const b64 = file.toString("base64")
      img = "data:image/png;base64,"+b64
    }

    const obj = { peer, type, name, data, avatar: img, date: new Date() }

    if(type === "audio"){
      const file = await window.node.files.cat(data)
      const b64 = file.toString("base64")
      obj.data = "data:audio/wav;base64,"+b64
    }

    const messages = this.state.messages;
    messages.push(obj);
    this.setState({ messages });
  };
  componentDidMount() {
    window.logger = this;
  }
  handleBlock = () => {
    const blocked = json(localStorage.getItem('blocked')) || []
    blocked.push(this.state.peer)
    localStorage.setItem('blocked', str(blocked))
    this.setState({menuAnchor: null, snackbar: "Cet utilisateur a été bloqué"})
  }
  render() {
    return <>
      <List style={{maxWidth: '1000px', margin: 'auto'}}>{
        [...this.state.messages].reverse().map((v, k) => (
          <ListItem key={this.state.messages.length-k}>
            <Avatar 
              src={v.avatar}
              children={<AvatarIcon/>}
              onClick={(ev) => {
                if(v.peer !== window.id)
                this.setState({menuAnchor: ev.target, peer: v.peer})
              }}
            />
            <ListItemText
              primary={(v.type!=='audio')?(
                <Linkify>{v.data}</Linkify>
              ):(
                <audio style={{width: '100%'}} controls>
                  <source src={v.data}/>
                </audio>
              )}
              secondary={<>
                <span>{"~"+v.name}</span>
                <span style={{float: 'right'}}>{date.format(v.date, "HH:mm:ss")}</span>
              </>}
            />
          </ListItem>
        ))
      }</List>
      <Menu
        anchorEl={this.state.menuAnchor}
        open={Boolean(this.state.menuAnchor)}
        onClose={() => this.setState({menuAnchor: null})}>
        <MenuItem onClick={this.handleBlock}>
          <ListItemIcon children={<BlockIcon/>}/>
          <ListItemText inset primary="Bloquer"/>
        </MenuItem>
      </Menu>
      <Snackbar
        color="inherit"
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        open={Boolean(this.state.snackbar)}
        autoHideDuration={6000}
        onClose={() => this.setState({snackbar: null})}
        message={this.state.snackbar}
        action={[
          <IconButton
            key="close"
            color="inherit"
            onClick={() => this.setState({snackbar: null})}
            children={<CloseIcon/>}
          />,
        ]}
      />
    </>
  }
}