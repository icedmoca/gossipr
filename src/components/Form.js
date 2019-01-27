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
import CircularProgress from '@material-ui/core/CircularProgress'
import SendIcon from '@material-ui/icons/Send'
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import RecordIcon from '@material-ui/icons/Mic'
import RecordNoneIcon from '@material-ui/icons/MicNone'
import CloseIcon from '@material-ui/icons/Clear'
import Recorder from 'recorder-js';

import { node, str, json, upload, dataURL } from '../index'

const msg = data => ({ 
  type: "message", 
  name: localStorage.getItem('name') || 'Gossipr', 
  data, 
  avatar: localStorage.getItem('avatar-hash') 
})

const audio = data => ({...msg(data), type: 'audio'})
const buffer = str => node.types.Buffer.from(str);
const send = data => publish(str(data));
const publish = str => {
  window.node.pubsub.publish("gossipr", buffer(str));
};

export default class extends React.Component {
  state = { ready: false, recording: false, record: null, dataURL: null, writing: false }
  componentDidMount() { window.form = this; }
  handleRecord = () => {
    if(!this.state.recording){
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      window.recorder = new Recorder(audioContext);
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          window.mediaStream = stream
          window.recorder.init(stream)
          window.recorder.start().then(() => {
            this.setState({ recording: true, record: null })
          })
        })
    } else {
      window.recorder.stop().then(({blob}) => {
        window.mediaStream.getTracks()[0].stop();
        dataURL(blob, (dataURL) => {
            this.setState({recording: false, record: blob, dataURL})
        })
      })
    }
  }
  handleSend = () => {
    if (!this.state.record) send(msg(document.getElementById('writingInput').value))
    else upload(this.state.record, (hash) => {
      send(audio(hash))
    }) 
  }
  handleClearWriting = () => {
    document.getElementById('writingInput').value = ""
    this.setState({writing: false})
  }
  render() {
    return <AppBar color="default" position='sticky'>
    <Toolbar style={{padding: '0 10px'}}>
        <IconButton 
          color={(this.state.recording)?'secondary':'default'}
          onClick={this.handleRecord}
          style={{width: 36, height: 36, padding: 0, marginRight: 10}}>
          {(this.state.recording)?(<RecordIcon/>):(<RecordNoneIcon/>)}
        </IconButton>
        {(!this.state.record)?(<>
          <InputBase
            id="writingInput"
            style={{flex: 1, margin: '0 10px 0 0'}}
            placeholder="Tapez un message"
            onFocus={ev => ev.target.select()}
            onChange={ev => this.setState({ writing: Boolean(ev.target.value)})}
            onKeyPress={ev => {
              (ev.key === "Enter") && send(msg(ev.target.value))
            }}
          />
          {(this.state.writing) && (
            <CloseIcon onClick={this.handleClearWriting}/>
          )}
        </>):(<>
          <CloseIcon onClick={() => this.setState({record: null})}/>
          <audio className='grow' controls>
            <source src={this.state.dataURL}/>
          </audio>
        </>)}
        {(this.state.ready) ? (
          <IconButton 
            style={{ width: 36, height: 36, padding: 0, marginLeft: 10 }}
            onClick={this.handleSend}>
            <SendIcon />
          </IconButton>
        ) : (
          <CircularProgress 
            style={{marginLeft: 10, marginRight: 10}}
            color='inherit' 
            size={20}/>
        )}
      </Toolbar>
      </AppBar>
  }
}