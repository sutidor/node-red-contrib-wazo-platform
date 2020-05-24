module.exports = function (RED) {
  const { setStatus, checkType, setErrorStatus } = require('./lib/helpers');

  function delete_node(config) {
    RED.nodes.createNode(this, config);
    conn = RED.nodes.getNode(config.server);
    this.client = conn.client.application;

    let node = this;
    setStatus(node);

    node.on('input', async (msg, send, done) => {
      setStatus(node, "running");

      const applicationUuid = config.applicationUuid || msg.payload.application_uuid;
      const nodeUuid = config.nodeUuid || msg.payload.data.items[0].uuid;

      checkType(node, nodeUuid, "string");
      checkType(node, applicationUuid, "string");  

      if (nodeUuid && applicationUuid) {
        node.log(`Deleting node ${nodeUuid} in application ${applicationUuid}`);
        try {
          const deletedNode = await node.client.removeNode(applicationUuid, nodeUuid);         
          
          setStatus(node, `Last deleted: ${nodeUuid}`, "green", "dot");
          msg.payload.application_uuid = applicationUuid;
          msg.payload.node_uuid = nodeUuid;
          msg.payload.deletedNode = deletedNode;
          send(msg);  
        }
        catch(err) {
          setErrorStatus(node, "Node could not be deleted, check inputs")    
          node.error(err);
          throw err;
        }             
        done();      
      }
      else {
        const text = "No Application UUID or Node UUID provided throw workflow msg or input field"
        setErrorStatus(node, text);
        const err = new Error(text);
        node.error(err);
        throw err;
      }
    });
  }

  RED.nodes.registerType("wazo delete_node", delete_node);
};