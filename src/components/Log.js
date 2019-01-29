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

import Remark from 'remark'
import RemarkReact from 'remark-react'
import RemarkImages from 'remark-images'
import RemarkBreaks from 'remark-breaks'

import { json, str } from "../index";

const Anchor = ({href, children}) => <a href={href} target='_blank' children={children}/>
const Image = ({src}) => <img src={src} style={{maxWidth: 90}}/>

export default class extends React.Component {
  state = { messages: [], menuAnchor: null, snackbar: null, peer: null, isBlocked: false, quote: null, name: null };
  componentDidMount() { window.logger = this }
  clear = () => this.setState({messages: [], snackbar: 'Tous les messages ont été effacés'})
  log = async (peer, { type, name, data, avatar }) => {
    let img = null;
    if (avatar) {
      const file = await window.node.files.cat(avatar);
      const b64 = file.toString("base64");
      img = "data:image/png;base64," + b64;
    }

    const obj = { peer, type, name, data, avatar: img, date: new Date() };

    if (type === "audio") {
      const file = await window.node.files.cat(data);
      const b64 = file.toString("base64");
      obj.data = "data:audio/wav;base64," + b64;
    }

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
    const head = "> ~"+this.state.name+":\n"
    const quote = "> "+this.state.quote.replace(new RegExp('\n', 'g'), '\n> ')+"\n\n"
    window.form.getInput().value += head+quote
    window.form.getInput().style.height = "190px"
    window.form.setState({writing: true})
    this.setState({ menuAnchor: null })
  }
  render() {
    return (
      <>
        <List style={{ maxWidth: "1000px", margin: "auto" }}>
          {[...this.state.messages].reverse().map((v) => (
            <ListItem key={v.date.getTime()} style={{alignItems: 'flex-end'}}>
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
                  (v.type === "audio") ? (
                    <audio style={{width: "100%", margin: '1em 0' }} controls>
                      <source src={v.data} />
                    </audio>
                  ) : (
                    Remark()
                    .use(RemarkReact, {remarkReactComponents: {a: Anchor, img: Image}})
                    .use(RemarkBreaks)
                    .use(RemarkImages)
                    .processSync(v.data).contents
                  )
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
