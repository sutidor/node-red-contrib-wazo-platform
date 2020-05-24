module.exports = function (RED) {
  'use strict';

  function setErrorStatus(node, text) {
      node.status({
          fill: 'red',
          shape: 'ring',
          text: (typeof text === "object") ? JSON.stringify(text) : text
      });
  }
  
  function setStatus(node, text, color, shape) {
    if (!text && !color && !shape) {
      node.status({});
    } else {
      node.status({
        fill: color || 'blue',
        shape: shape || 'ring',
        text: text || ''
      });
    }
  }
  
  function checkType(node, parameter, type) {
    if (typeof parameter !== type) {
      const text = RED._('delete_node.errors.falsetype') + type;
      setErrorStatus(node, text);
      throw new Error(text);
    }
  }

  function delete_node(config) {
    RED.nodes.createNode(this, config);
    conn = RED.nodes.getNode(config.server);
    this.client = conn.client.application;

    let node = this;
    setStatus(node);

    node.on('input', async (msg, send, done) => {
      setStatus(node, "running");

      node.log(msg.payload.application_uuid)

      applicationUuid = config.applicationUuid || msg.payload.application_uuid;
      nodeUuid = config.nodeUuidnode || msg.payload.node_uuid;

      checkType(node, nodeUuid, "string");
      checkType(node, applicationUuid, "string");  

      node.log(applicationUuid)
      
      node.log(nodeUuid, applicationUuid)

      if (nodeUuid && applicationUuid) {
        node.log("Delete node");
        try {
          const deletedNode = await node.client.removeNode(applicationUuid, nodeUuid);         
          node.log(deletedNode);
          setStatus(node, `Last deleted: ${nodeUuid}`, "green", "dot");
          msg.payload.application_uuid = applicationUuid;
          msg.payload.node_uuid = nodeUuid;
          msg.payload.deletedNode = deleteNode;
          node.send(msg);  
        }
        catch(err) {        
          node.error(err);
          throw err
        }             
        node.done();      
      }
      else {
        const err = new Error("No Application UUID or Node UUID provided throw workflow msg or input field")
        node.error(err);
        throw err;
      }
    });
  }

  RED.nodes.registerType("wazo delete_node", delete_node);
};