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

import { dataURL } from '/src/index'

import * as Messenger from '/src/Messenger'

export default class extends React.Component {
  state = { recording: false, record: null, dataURL: null, value: '' }
  componentDidMount() {  window.form = this; }

  handleInputChange = ev => this.setState({ value: ev.target.value })
  clearValue = () => this.setState({ value: '', record: null })

  handleRecord = async () => {
    if(!this.state.recording){
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      window.recorder = new Recorder(audioContext);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      window.mediaStream = stream
      window.recorder.init(stream)
      await window.recorder.start()
      this.setState({ recording: true, record: null })
    } else {
      const {blob} = await window.recorder.stop()
      window.mediaStream.getTracks()[0].stop();
      const uri = await dataURL(blob)
      this.setState({ recording: false, record: blob, dataURL: uri })
    }
  }

  fileUploaderRef = (it) => this.fileUploader = it
  handleFileUploadClick = () => this.fileUploader.click()
  handleFileUpload = (ev) => {
    const file = ev.target.files[0]
    ev.target.value = ""
    Messenger.sendUpload(file)
  }

  handleSend = () => {
    if(this.input) this.input.focus()
    if(this.state.record) Messenger.sendUpload(this.state.record) 
    else{
      const value = this.state.value
      if(value) Messenger.sendPublish(value)
    }
    this.clearValue()
  }

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
          <CloseIcon onClick={this.clearValue}/>
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
        <IconButton 
          style={{ width: 36, height: 36, padding: 0, marginLeft: 10 }}
          onClick={this.handleSend}>
          <SendIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  }
}