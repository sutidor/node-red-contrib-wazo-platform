module.exports = function (RED) {
  const { setStatus, checkType, setErrorStatus, getNodeParameter } = require('./lib/helpers');
  const { WazoApiClient } = require('@wazo/sdk');
  const fetch = require('node-fetch');
  const https = require("https");

  const agent = new https.Agent({
    rejectUnauthorized: false
  });
    
  function create_node(config) {

    RED.nodes.createNode(this, config);
    conn = RED.nodes.getNode(config.server);
    this.refreshToken = config.refreshToken;
    this.client = conn.client.application;

    let node = this;
    setStatus(node);

    node.on('input', async (msg, send, done) => {
      setStatus(node, "running");

      const applicationUuid = getNodeParameter(RED, node, msg, config.applicationUuid, config.applicationUuidType) || msg.payload.application_uuid;
      const callId = getNodeParameter(RED, node, msg, config.callUuid, config.callUuidType) || msg.payload.call.id || msg.payload.call_id;
  
      if (checkType(RED, node, callId, "string") && checkType(RED, node, applicationUuid, "string")) {
        
        try{
          const token = await conn.authenticate();
          const url = `https://${conn.host}:${conn.port}/api/calld/1.0/applications/${applicationUuid}/nodes`;
          const nodeCreated = await createNodeAddCall(url, token, callId);
          node.log(`Add call to node ${nodeCreated.uuid}`);
          setStatus(node, `Last created: ${nodeCreated.uuid}`, "green", "dot");
          msg.payload.call_id = callId;
          msg.payload.application_uuid = applicationUuid;
          msg.payload.node_uuid = nodeCreated.uuid;
          msg.payload.node_created = nodeCreated;
          node.send(msg);

        } catch(err) {
          setErrorStatus(node, "Node could not be created, check inputs")    
          node.error(err);
          throw err;
        }
      }
      done();
    });
  }

  // FIXME: Remove when SDK will be ready
  const createNodeAddCall = async (url, token, call_id) => {
    const body = {
      calls: [{
        id: call_id
      }]
    };

    const options = {
        method: 'POST',
        agent: agent,
        body: JSON.stringify(body),
        headers: {
          'content-type': 'application/json',
          'X-Auth-Token': token
        }
    };

    return fetch(url, options).then(response => response.json()).then(data => data);
  };

  RED.nodes.registerType("wazo create_node", create_node);

};