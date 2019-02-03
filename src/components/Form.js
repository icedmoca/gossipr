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
import FileIcon from '@material-ui/icons/Folder'

import Recorder from 'recorder-js';

import { str, upload, dataURL } from '../index'

const msg = data => ({ 
  type: "message", 
  name: localStorage.getItem('name') || 'Gossipr', 
  data, 
  date: new Date().getTime(),
  avatar: localStorage.getItem('avatar-hash') 
})

const buffer = str => window.node.types.Buffer.from(str);
const send = data => publish(str(data));
const publish = str => {
  window.node.pubsub.publish("gossipr"+window.location.hash, buffer(str));
};

export default class extends React.Component {
  state = { ready: window.node && window.node.isOnline(), recording: false, record: null, dataURL: null, value: '' }
  componentDidMount() {  window.form = this; }
  fileUploaderRef = (it) => this.fileUploader = it
  handleClearRecord = () => this.setState({ record: null })
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
  handleFileUploadClick = () => this.fileUploader.click()
  handleFileUpload = (ev) => {
    const file = ev.target.files[0]
    ev.target.value = ""
    upload(file, (hash) => {
      send(msg('https://ipfs.io/ipfs/'+hash))
    })
  }
  clearValue = () => this.setState({value: '', record: null})
  handleSend = () => {
    if(this.input) this.input.focus()
    if (!this.state.record){
      const value = this.state.value
      if(value) send(msg(value))
    }
    else upload(this.state.record, (hash) => {
      send(msg('https://ipfs.io/ipfs/'+hash))
    }) 
    this.clearValue()
  }
  handleInputChange = ev => this.setState({ value: ev.target.value })
  render() {
    return <AppBar 
    color="default"
    position='fixed'
    style={{ top: 'auto', bottom: 0 }}>
    <Toolbar style={{padding: '0 10px'}}>
        <IconButton 
          color={(this.state.recording)?'secondary':'default'}
          onClick={this.handleRecord}
          style={{width: 36, height: 36, padding: 0, marginRight: 5}}
          children={(this.state.recording)?(<RecordIcon/>):(<RecordNoneIcon/>)}
        />
        <input 
          ref={this.fileUploaderRef}
          type='file' 
          style={{display: 'none'}}
          onChange={this.handleFileUpload}
        />
        <IconButton
          onClick={this.handleFileUploadClick}
          style={{width: 36, height: 36, padding: 0, marginRight: 10}}
          children={<FileIcon/>}
        />
        {(this.state.record)?(<>
          <CloseIcon onClick={this.handleClearRecord}/>
          <audio className='grow' controls>
            <source src={this.state.dataURL}/>
          </audio>
        </>) : (<>
          <InputBase
            autoFocus
            inputRef={(it) => this.input = it}
            multiline={true}
            rowsMax="10"
            style={{flex: 1, margin: '0 10px 0 0'}}
            placeholder="Tapez un message"
            value={this.state.value}
            onFocus={this.handleFocus}
            onChange={this.handleInputChange}
          />
          {(this.state.value) && (
            <CloseIcon onClick={this.clearValue}/>
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