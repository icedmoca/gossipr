import React from "react";

import CircularProgress from '@material-ui/core/CircularProgress'
import Image from './Image'
import fileType from 'file-type'
import Node from '../Node'

export default class extends React.Component {
  state = { type: 'anchor', source: this.props.href }

  componentDidMount() {
    (async () => {
      const { href } = this.props
      const ipfsPattern = /^https?:\/\/[^/]+\/(ip(f|n)s)\/((\w+).*)/
      const ipfsMatch = href.match(ipfsPattern)
      if(!ipfsMatch) return
      const hash = ipfsMatch[4]

      this.setState({ type: 'loading' })
      const fallback = () => this.setState({type: 'anchor'})

      //const {size} = (await Node.node.files.get(hash))[0]
      //console.log('Received file size', size)
      //if(size > 10000000) return fallback()

      const file = await Node.node.files.cat(hash)

      const {ext, mime} = fileType(file)
      const type = mime.split('/')[0]
      const mimes = ['audio', 'image', 'video']
      if(!mimes.includes(type)) return fallback()

      const source = "data:"+type+"/"+ext+";base64,"+file.toString("base64");
      this.setState({ type, source })
    })()
  }
  render() {
    const { children } = this.props
    const { type, source } = this.state
    if (type === "loading")
      return <CircularProgress color='inherit' size={20} />
    if (type === 'audio')
      return <audio
        controls
        style={{ width: "100%" }}
        children={<source src={source} />}
      />
    if (type === 'image')
      return <Image src={source} />
    if (type === 'video')
      return <video
        controls
        style={{ width: '100%', maxWidth: 500, maxHeight: 500 }}
        children={<source src={source} />}
      />
    if(children[0].type && children[0].type.name === 'Image')
      return <>{children}</>
    return <a href={source} target='_blank' children={children} />
  }
}