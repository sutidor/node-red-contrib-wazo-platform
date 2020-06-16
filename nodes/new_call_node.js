module.exports = function (RED) {
  const { setStatus, checkType, setErrorStatus, getNodeParameter } = require('./lib/helpers');
  const { WazoApiClient } = require('@wazo/sdk');
    
  function new_call_node(config) {
    RED.nodes.createNode(this, config);
    conn = RED.nodes.getNode(config.server);
    this.client = conn.client.application;

    let node = this;
    setStatus(node);

    node.on('input', async (msg, send, done) => {
      setStatus(node, "running");

      const applicationUuid = getNodeParameter(RED, node, msg, config.applicationUuid, config.applicationUuidType) || msg.payload.application_uuid;
      const nodeUuid = getNodeParameter(RED, node, msg, config.nodeUuid, config.nodeUuidType) || msg.payload.node_uuid;
      const exten = getNodeParameter(RED, node, msg, config.exten, config.extenType) || msg.payload.exten;
      const context = getNodeParameter(RED, node, msg, config.context, config.contextType) || msg.payload.context;
      const autoAnswer = getNodeParameter(RED, node, msg, config.autoAnswer, config.autoAnswerType) || msg.payload.autoanswer || false;

      if (checkType(RED, node, nodeUuid, "string") && checkType(RED, node, applicationUuid, "string") && checkType(RED, node, exten, "string") && checkType(RED, node, context, "string") && checkType(RED, node, autoAnswer, "boolean")) {
        try {
          const new_call_node = await node.client.addNewCallNodes(applicationUuid, nodeUuid, context, exten, autoAnswer);
          setStatus(node, `Last called: ${exten}`, "green", "dot");
          msg.payload.application_uuid = applicationUuid;
          msg.payload.node_uuid = nodeUuid;
          msg.payload.call_id = new_call_node.uuid;
          msg.payload.new_call_node = new_call_node;
          node.send(msg);
        }
        catch(err) {
          setErrorStatus(node, "Call could not be started, check inputs")    
          node.error(err);
          throw err;
        }
      }
      done();
    });

  }

  RED.nodes.registerType("wazo new_call_node", new_call_node);

};