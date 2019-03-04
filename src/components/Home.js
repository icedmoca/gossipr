import React from 'react'

import '../index.css';

import logo from '../favicon.ico'

import Typography from '@material-ui/core/Typography'
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import JoinIcon from '@material-ui/icons/Send'

import Toolbar from '@material-ui/core/Toolbar'
import PinIcon from '@material-ui/icons/PinDrop'

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button'
import AppBar from '@material-ui/core/AppBar'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'

import photo1 from '../photo1.jpg'
import photo2 from '../photo2.jpg'
import photo3 from '../photo3.jpg'

import DownIcon from '@material-ui/icons/KeyboardArrowDown'
import UpIcon from '@material-ui/icons/KeyboardArrowUp'
import CodeIcon from '@material-ui/icons/Code'

import Data from '../Data'
import Lang from '../Lang'

export default class extends React.Component {
  componentDidMount(){ window.home = this }
  
  handleJoin = () => {
    let channel = this.input.value
    if(!channel) return
    channel = channel.replace(new RegExp(' ', 'g'), '-')
    if(!channel.startsWith('#')) channel = '#'+channel
    Data.newfag = false
    window.location.hash = channel
    window.app.setState({})
  }

  refPinDialog = (it) => this.pinDialog = it
  handlePinDialogOpen = () => this.pinDialog.handleOpen()

  openGitHub = () => window.open('https://github.com/Hazae41/Gossipr', '_blank')

  render(){
    const theme = this.props.theme.palette.type
    return (<>
      <AppBar position="absolute"  style={{ background: 'transparent', boxShadow: 'none'}}>
        <Toolbar style={{justifyContent: 'flex-end'}}>
          <IconButton
            onClick={this.openGitHub}
            children={<CodeIcon/>}
          />
          <IconButton 
            onClick={this.handlePinDialogOpen}
            children={<PinIcon/>}  
          />
          <PinDialog ref={this.refPinDialog}/>
        </Toolbar>
      </AppBar>
      <Grid container>
          <Grid item xs={12} 
            container 
            spacing={16}
            style={{padding: 32, minHeight: '100vh' }}
            direction="column"
            justify="space-evenly"
            alignItems="center">
            <Grid item container
              spacing={32}
              direction="column"
              justify="center"
              alignItems="center">
              <Grid item>
                <img  src={logo} />
              </Grid>
              <Grid item>
                <Typography style={{ textAlign: 'center' }} variant="h3" children={Lang().home_page.title} />
              </Grid>
              <Grid item>
                <Typography style={{ textAlign: 'center', maxWidth: 800 }} variant="h6" 
                  children={Lang().home_page.text} 
                />
              </Grid>
              <Grid item>
                <TextField
                  id="channelInput"
                  style={{ flex: 1, maxWidth: 300 }}
                  label={Lang().join_channel}
                  defaultValue={Data.channel.substr(1) || 'main'}
                  inputRef={(it) => this.input = it}
                  onKeyPress={(e) => (e.key === 'Enter') && this.handleJoin()}
                  helperText={Lang().join_channel_hint}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">#</InputAdornment>
                  }}
                />
                <IconButton
                  onClick={this.handleJoin}
                  children={<JoinIcon />}
                />
              </Grid>
            </Grid>
            <Grid item >
              <IconButton onClick={() => document.getElementById('homeFirst').scrollIntoView({ behavior: 'smooth'})}>
                <DownIcon />
              </IconButton>
            </Grid>
        </Grid>
        <Grid item xs={12} sm={6}>
          <img style={{objectFit: 'cover', width: '100%', height: '100%'}} src={photo1}/>
        </Grid>
        <Grid item xs={12} sm={6}
        id='homeFirst'
        container
        style={{ 
          padding: 32, 
          minHeight: '100vh', 
          background: (theme === 'dark') ?'darkslateblue':'lavender'
        }}
        direction="column"
        justify="space-evenly"
        alignItems="center">
          <Grid item>
            <Typography variant='h3' children={Lang().home_page.first.title} />
          </Grid>
          <Grid item style={{maxWidth: 500}}>
            <br/>
            <Typography style={{textAlign: 'center'}} variant='h6' children={Lang().home_page.first.text1} />
            <br/>
            <Typography style={{textAlign: 'center'}} variant='h6' children={Lang().home_page.first.text2} />
          </Grid>
          <Grid item style={{position: 'relative'}}>
            <IconButton onClick={() => document.getElementById('homeSecond').scrollIntoView({ behavior: 'smooth' })}>
              <DownIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6}>
          <img style={{objectFit: 'cover', width: '100%', height: '100%'}} src={photo2}/>
        </Grid>
        <Grid item xs={12} sm={6}
        container
        id='homeSecond'
        style={{ 
          padding: 32, 
          minHeight: '100vh',
          background: (theme === 'dark')?'brown':'bisque'
        }}
        direction="column"
        justify="space-evenly"
        alignItems="center">
          <Grid item>
            <Typography variant='h3' children={Lang().home_page.second.title} />
          </Grid>
          <Grid item style={{maxWidth: 500}}>
            <br/>
            <Typography style={{textAlign: 'center'}} variant='h6' children={Lang().home_page.second.text} />
          </Grid>
          <Grid item style={{ position: 'relative' }}>
            <IconButton onClick={() => document.getElementById('homeThird').scrollIntoView({ behavior: 'smooth' })}>
              <DownIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6}>
          <img style={{objectFit: 'cover', width: '100%', height: '100%'}} src={photo3}/>
        </Grid>
        <Grid item xs={12} sm={6}
        container
        id='homeThird'
        style={{ 
          padding: 32, 
          minHeight: '100vh',
          background: (theme === 'dark') ?'seagreen':'lightpink'
        }}
        direction="column"
        justify="space-evenly"
        alignItems="center">
          <Grid item>
            <Typography variant='h3' children={Lang().home_page.third.title} />
          </Grid>
          <Grid item style={{maxWidth: 500}}>
            <br/>
            <Typography style={{textAlign: 'center'}} variant='h6' children={Lang().home_page.third.text1} />
            <br/>
            <Typography style={{textAlign: 'center'}} variant='h6' children={Lang().home_page.third.text2} />
          </Grid>
          <Grid item style={{ position: 'relative' }}>
            <IconButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <UpIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
    </>)
  }
}

class PinDialog extends React.Component{
  state = {open: false}

  handlePin = async () => {
    try{
      this.setState({ loading: true })
      const api = await window.ipfs.enable()
      await api.pin.add('/ipns/QmTgbepCJdFFEBjUcCmLD7FM76oKkPWBbEGidsXswMqea3')
      window.app.snackbar(Lang().pin_dialog.pinned)
    } catch(err){
      window.app.snackbar(err.message)
    }
    this.setState({ loading: false })
  }

  handleOpen = () => this.setState({open: true})
  handleClose = () => this.setState({open: false})
  handleClickDesktop = () => window.open('https://github.com/ipfs-shipyard/ipfs-desktop/releases', '_blank')
  handleClickExtension = () => window.open('https://github.com/ipfs-shipyard/ipfs-companion#install', '_blank')
  render(){
    return (
      <Dialog
        open={this.state.open}
        onClose={this.handleClose}>
        <DialogTitle children={Lang().pin_dialog.title}/>
        <DialogContent>
          <DialogContentText>
            {Lang().pin_dialog.text1}<br/>{Lang().pin_dialog.text2}
          {(!window.ipfs) && (<>
            <br/><br/>{Lang().pin_dialog.install}<br/>
            <Button style={{ margin: 5}} variant="outlined" children={Lang().pin_dialog.ipfs_node}
            onClick={this.handleClickDesktop} />
            <Button style={{ margin: 5}} variant="outlined" children={Lang().pin_dialog.browser_addon}
            onClick={this.handleClickExtension} />
          </>)}
          </DialogContentText>
          <br/>
          {(this.state.loading) && (
            <Grid container justify='center'>
              <Grid item>
                <Typography children={<CircularProgress color='inherit' />}/>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button children={Lang().close} onClick={this.handleClose}  />
          {(window.ipfs) && (<Button children={Lang().pin_dialog.pin} onClick={this.handlePin} />)}
        </DialogActions>
      </Dialog>
    )
  }
}