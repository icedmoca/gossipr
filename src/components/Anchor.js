import React from "react";

import CircularProgress from '@material-ui/core/CircularProgress'

import Image from './Image'

export default class extends React.Component {
  state = { type: 'anchor', source: this.props.href }

  async componentDidMount() {
    const { href } = this.props
    const ipfsPattern = /^https?:\/\/[^/]+\/(ip(f|n)s)\/((\w+).*)/
    const ipfsMatch = href.match(ipfsPattern)
    if (ipfsMatch) {
      const hash = ipfsMatch[4]

      const source = '/ipfs/'+hash
      this.setState({type: 'loading', source})
      
      //const props = await window.node.files.get(hash)
      //console.log('Received file size', props[0].size)
      //if(props[0].size > 10000000)
      //  return this.setState({type: 'anchor'})

      //const mimes = ['audio', 'image', 'video']
      //const mime = Mime.lookup(source)
      //const type = mime.split('/')[0]
      //if(mimes.includes(type)) this.setState({ type })
    }
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