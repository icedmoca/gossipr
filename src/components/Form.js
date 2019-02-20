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
import ListItemText from '@material-ui/core/ListItemText'

import Recorder from 'recorder-js';

import { dataURL } from '../index'

import * as Messenger from '../Messenger'
import Data from '../Data'
import Node from '../Node'

export default class extends React.Component {
  state = { recording: false, record: null, dataURL: null, value: '', quote: null }
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
  handleFileUpload = async (ev) => {
    const file = ev.target.files[0]
    ev.target.value = ""
    const url = await Node.sendFile(file)
    this.send(url)
  }

  handleSend = async () => {
    if(this.input) this.input.focus()

    if(this.state.record) {
      const url = await Node.sendFile(this.state.record) 
      this.send(url)
    }

    else {
      const value = this.state.value
      if(value) this.send(value)
    }
    
    this.clearValue()
  }

  send = (data) => {
    const {quote} = this.state
    this.state.quote = null
    if(!quote) return Node.sendMessage(data)
    const body = '> ' + quote.data.replace(new RegExp('\n', 'g'), '\n> ')
    const foot = '> ~'+quote.meta.name
    const message = body + '\n' + foot + '\n\n' + data
    Node.sendMessage(message)
  }

  handleQuote = (quote) => this.setState({quote})
  clearQuote = () => this.setState({quote: null})

  render() {
    return <AppBar 
    color="secondary"
    position='fixed'
      style={{ top: 'auto', bottom: 0 }}>
    {(this.state.quote) && (
        <Toolbar style={{ paddingTop: 10, justifyContent: 'center'}}>
        <CloseIcon onClick={this.clearQuote}/>
        <ListItemText  
          style={{ flex: 1, maxWidth: 1000, whiteSpace: 'pre-line' }}
          primary={this.state.quote.data} 
          secondary={"~" + this.state.quote.meta.name}/> 
      </Toolbar>
    )}
    <Toolbar style={{padding: '0 10px', maxWidth: 1000, width: '100%', margin: 'auto'}}>
        <IconButton 
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
          <audio style={{flex: 1}} controls>
            <source src={this.state.dataURL}/>
          </audio>
        </>) : (<>
          <InputBase
            autoFocus
            inputRef={(it) => this.input = it}
            multiline={Data.multiline}
            rowsMax="10"
            style={{flex: 1, margin: '0 10px 0 0'}}
            placeholder="Tapez un message"
            value={this.state.value}
            onFocus={this.handleFocus}
            onChange={this.handleInputChange}
            onKeyPress={(e) => (!Data.multiline) && (e.key === 'Enter') && this.handleSend()}
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