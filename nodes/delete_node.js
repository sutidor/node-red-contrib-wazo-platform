module.exports = function (RED) {
  const { setStatus, checkType, setErrorStatus, getNodeParameter } = require('./lib/helpers');

  function delete_node(config) {
    RED.nodes.createNode(this, config);
    conn = RED.nodes.getNode(config.server);
    this.client = conn.client.application;

    let node = this;
    setStatus(node);

    node.on('input', async (msg, send, done) => {
      setStatus(node, "running");

      const applicationUuid = getNodeParameter(RED, node, msg, config.applicationUuid, config.applicationUuidType) || msg.payload.application_uuid;
      const nodeUuid = getNodeParameter(RED, node, msg, config.nodeUuid, config.nodeUuidType) || msg.payload.node_uuid || msg.payload.uuid;
  
      if (checkType(RED, node, nodeUuid, "string") && checkType(RED, node, applicationUuid, "string")) {
        node.log(`Deleting node ${nodeUuid} in application ${applicationUuid}`);
        try {
          const deletedNode = await node.client.removeNode(applicationUuid, nodeUuid);         
          
          setStatus(node, `Last deleted: ${nodeUuid}`, "green", "dot");
          msg.payload.application_uuid = applicationUuid;
          msg.payload.node_uuid = nodeUuid;
          msg.payload.deletedNode = deletedNode;
          send(msg); 

        } catch(err) {
          setErrorStatus(node, "Node could not be deleted, check inputs")    
          node.error(err);
          throw err;
        }       
      }
      done();
    });
  }

  RED.nodes.registerType("wazo delete_node", delete_node);
};