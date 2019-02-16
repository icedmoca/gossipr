import React from 'react'

import '../index.css';

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from '@material-ui/core/IconButton'

import MenuIcon from '@material-ui/icons/Menu'
import PeopleIcon from '@material-ui/icons/People'

import * as Messenger from '../Messenger'
import Data from '../Data'

export default class extends React.Component{
  state = {peers: 0 }
  componentDidMount(){ window.appBar = this } 

  handleClearAll = () => window.logger.clearAll()
  handleTogglePinnedAtTop = () => window.logger.togglePinnedAtTop()

  render(){
    return <AppBar 
      color='primary'
      style={{ boxShadow: 'none' }}
      position="sticky">
      <Toolbar style={{padding: '0 10px', maxWidth: 1000, width: '100%', margin: 'auto'}}  >
        <Typography 
          style={{
            flex: 1, marginRight: 20, maxWidth: 1000,
            textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'
          }}
          color="inherit" 
          variant="h6" 
          children={Data.channel}
        />
        <Typography color="inherit" variant="h6" children={this.state.peers} />
        <PeopleIcon style={{marginLeft: 5}}/>
        <IconButton
          style={{ width: 36, height: 36, padding: 0, marginLeft: 10 }}
          color='inherit'
          children={<MenuIcon />}
          onClick={() => window.drawer.open()}
        />
      </Toolbar>
    </AppBar>
  }
}