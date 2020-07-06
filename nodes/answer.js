module.exports = function (RED) {
  const { setStatus, checkType, setErrorStatus, getNodeParameter } = require('./lib/helpers');

  function answer(config) {
    RED.nodes.createNode(this, config);
    conn = RED.nodes.getNode(config.server);
    this.client = conn.client.application;

    let node = this;
    setStatus(node);

    node.on('input', async (msg, send, done) => {
      setStatus(node, "running");

      const applicationUuid = getNodeParameter(RED, node, msg, config.applicationUuid, config.applicationUuidType) || msg.payload.application_uuid;
      const callId = getNodeParameter(RED, node, msg, config.callUuid, config.callUuidType) || msg.payload.call.id || msg.payload.call_id;
  

      if (checkType(RED, node, callId, "string") && checkType(RED, node, applicationUuid, "string")) {   
        try{ 
          const result = await node.client.answerCall(applicationUuid, callId);
          node.log('Call answer');
          setStatus(node, `Answered call: ${callId}`, "green", "dot");
          msg.payload.call_id = callId;
          msg.payload.application_uuid = applicationUuid;
          msg.payload.answer = result;
          node.send(msg);
        }
        catch(err) {
          setErrorStatus(node, "Call could not be answered, check inputs")    
          node.error(err);
          throw err;
        }
      }
      done();
    });  
  }

  RED.nodes.registerType("wazo answer", answer);

};