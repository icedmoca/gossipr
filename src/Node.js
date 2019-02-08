export const subscribe = async (hash) => {
  const node = window.node

  const subscribed = await node.pubsub.ls()
  if(subscribed.includes('gossipr'+hash)) return;

  const current = () => (window.location.hash === hash)
  if(current() && window.form) window.form.setState({ ready: false });

  await node.pubsub.subscribe("gossipr"+hash, async packet => {
    const msg = json(packet.data.toString());

    const blocked = json(localStorage.getItem("blocked")) || [];
    msg.peer = packet.from
    if(blocked.includes(msg.peer)) return

    getMessages(hash).push(msg)
    if(current() && window.logger) window.logger.setState({})
    else notify(hash, msg)

    await retrieveAvatar(msg)
    if (current() && window.logger) window.logger.setState({})
  });

  console.log('Subscribed to', hash)
  if(current() && window.form) window.form.setState({ ready: true });
}
