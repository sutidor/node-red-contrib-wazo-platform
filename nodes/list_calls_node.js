module.exports = function (RED) {
  const { setStatus, checkType, setErrorStatus, getNodeParameter } = require('./lib/helpers');
  const { WazoApiClient } = require('@wazo/sdk');

  function list_calls_node(config) {
    RED.nodes.createNode(this, config);
    conn = RED.nodes.getNode(config.server);
    this.client = conn.client.application;

    let node = this;
    setStatus(node);

    node.on('input', async (msg, send, done) => {
      const applicationUuid = getNodeParameter(RED, node, msg, config.applicationUuid, config.applicationUuidType) || msg.payload.application_uuid;
      const nodeUuid = getNodeParameter(RED, node, msg, config.nodeUuid, config.nodeUuidType) || msg.payload.node_uuid || msg.payload.uuid;

      if (checkType(RED, node, nodeUuid, "string") && checkType(RED, node, applicationUuid, "string")) {
        node.log(`Listing calls of node ${nodeUuid} in application ${applicationUuid}`);
        try {  
          const callsOfNode = await node.client.listCallsNodes(applicationUuid, nodeUuid);

          setStatus(node, `Last nodes calls listed: ${nodeUuid}`, "green", "dot");
          msg.payload.application_uuid = applicationUuid;
          msg.payload.node_uuid = nodeUuid;
          msg.payload.callsOfNNode = callsOfNode;
          node.send(msg);
        }
        catch(err) {
          setErrorStatus(node, "Calls of node could not be listed, check inputs")    
          node.error(err);
          throw err;
        }        
      }
      done();
    });

  }

  RED.nodes.registerType("wazo list_calls_node", list_calls_node);

};