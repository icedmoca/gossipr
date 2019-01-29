import React from "react";

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import CircularProgress from '@material-ui/core/CircularProgress'
import SendIcon from '@material-ui/icons/Send'
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import RecordIcon from '@material-ui/icons/Mic'
import RecordNoneIcon from '@material-ui/icons/MicNone'
import CloseIcon from '@material-ui/icons/Clear'
import Recorder from 'recorder-js';
import MultilineIcon from '@material-ui/icons/SubdirectoryArrowLeft'
import SinglelineIcon from '@material-ui/icons/ArrowForward'

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
  window.node.pubsub.publish("gossipr"+window.location.hash, buffer(str));
};

export default class extends React.Component {
  state = { ready: false, multiline: true, recording: false, record: null, dataURL: null, writing: false }
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
  getInput = () => document.getElementById('writingInput')
  setValue = () => this.getInput().value = this.state.value
  clearValue = () => {
    this.getInput().value = ""
    this.setState({multiline: false})
    setTimeout(() => {
      this.setState({multiline: true})
      this.getInput().focus()
    }, 100)
  }
  handleSend = () => {
    if (!this.state.record){
      send(msg(this.getInput().value))
      this.handleClearWriting()
    }
    else upload(this.state.record, (hash) => {
      send(audio(hash))
    }) 
  }
  handleClearWriting = () => {
    this.clearValue()
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
        {(this.state.record)?(<>
          <CloseIcon onClick={() => this.setState({record: null})}/>
          <audio className='grow' controls>
            <source src={this.state.dataURL}/>
          </audio>
        </>) : (<>
          <InputBase
            multiline={this.state.multiline}
            rowsMax="10"
            id="writingInput"
            style={{flex: 1, margin: '0 10px 0 0'}}
            placeholder="Tapez un message"
            onFocus={this.handleFocus}
            onChange={ev => this.setState({ writing: Boolean(ev.target.value)})}
            onKeyPress={ev => {
              (!this.state.multiline) && (ev.key === "Enter") && this.handleSend()
            }}
          />
          {(this.state.writing) && (
            <CloseIcon onClick={this.handleClearWriting}/>
          )}
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