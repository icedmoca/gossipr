import React from "react";

import CircularProgress from '@material-ui/core/CircularProgress'

import Image from './Image'

import fileType from 'file-type'

export default class extends React.Component {
  state = { type: 'anchor', blob: null }
  async componentDidMount() {
    const { href } = this.props
    const ipfsPattern = /^https?:\/\/[^/]+\/(ip(f|n)s)\/((\w+).*)/
    const ipfsMatch = href.match(ipfsPattern)
    if (ipfsMatch) {
      const hash = ipfsMatch[4]
      this.setState({ type: 'loading' })
      
      const props = await window.node.files.get(hash)
      console.log('Received file size', props[0].size)
      if(props[0].size > 10000000)
        return this.setState({type: 'anchor'})

      const file = await window.node.files.cat(hash)
      const mime = fileType(file)
      const type = mime.mime.split('/')[0]
      if (['audio', 'image', 'video'].includes(type)) {
        const b64 = file.toString("base64");
        const blob = "data:" + type + "/" + mime.ext + ";base64," + b64;
        this.setState({ type, blob })
      }
    }
  }
  render() {
    const { href, children } = this.props
    const { type, blob } = this.state
    if (type === "loading")
      return <CircularProgress color='inherit' size={20} />
    if (type === 'audio')
      return <audio
        controls
        style={{ width: "100%" }}
        children={<source src={blob} />}
      />
    if (type === 'image')
      return <Image src={blob} />
    if (type === 'video')
      return <video
        controls
        style={{ width: '100%', maxWidth: 500, maxHeight: 500 }}
        children={<source src={blob} />}
      />
    if(children[0].type && children[0].type.name === 'Image')
      return <>{children}</>
    return <a href={href} target='_blank' children={children} />
  }
}