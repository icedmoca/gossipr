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

export default class extends React.Component {
  state = { messages: [] };
  log = async ({type, name, data, avatar}) => {
    let img = null
    if(avatar){
      const file = await window.node.files.cat(avatar)
      const b64 = file.toString("base64")
      img = "data:image/png;base64,"+b64
    }

    const obj = { type, name, data, avatar: img, date: new Date() }

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
  render() {
    return <List style={{maxWidth: '1000px', margin: 'auto'}}>{
      [...this.state.messages].reverse().map((v, k) => (
        <ListItem key={this.state.messages.length-k}>
          <Avatar src={v.avatar}><AvatarIcon/></Avatar>
          <ListItemText
            primary={(v.type!=='audio')?(
              <Linkify>{v.data}</Linkify>
            ):(
              <audio style={{width: '100%'}} controls>
                <source src={v.data}/>
              </audio>
            )}
            secondary={<>
              <span>{" ~"+v.name}</span>
              <span style={{float: 'right'}}>{date.format(v.date, "HH:mm:ss")}</span>
            </>}
          />
        </ListItem>
      ))
    }</List>
  }
}