module.exports = function (RED) {
    
  function stop_progress(config) {
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
          const result = await node.client.stopProgressCall(application_uuid, call_id);
          node.log('Stop call progress');
          setStatus(node, `Stopped progress on call: ${callId}`, "green", "dot");
          msg.payload.call_id = call_id;
          msg.payload.application_uuid = application_uuid;
          msg.payload.stop_progress_success = result;
          node.send(msg);

        } catch (err) {
          setErrorStatus(node, "Progress could not be stopped, check inputs")    
          node.error(err);
          throw err;
        }
      }
      done();
    });
  }

  RED.nodes.registerType("wazo stop_progress", stop_progress);
};