import React from "react";
import ReactDOM from "react-dom";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import AvatarIcon from "@material-ui/icons/Person";
import IconButton from '@material-ui/core/IconButton'
import InstallIcon from '@material-ui/icons/GetApp'
import CloseIcon from '@material-ui/icons/Clear'
import icon from '../shareicon.png'

const isInstalled = (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone);
const isiOS = ['iPhone', 'iPad', 'iPod'].includes(navigator.platform)

export default class extends React.Component {
  state = { active: (isiOS && !isInstalled) }
  render() {
    if (!this.state.active) return null;
    return <AppBar
      color='default'
      position='fixed'
      style={{ top: 'auto', bottom: 0 }}
    >
      <Toolbar
        style={{ justifyContent: 'space-between' }}
      >
        <img alt="install-icon" src={icon} style={{ width: '24px' }} />
        <Typography variant="h7">
          Ajoutez Gossipr à l'écran d'accueil
        </Typography>
        <CloseIcon onClick={() => this.setState({ active: false })} />
      </Toolbar>
    </AppBar>
  }
}