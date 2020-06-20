module.exports = function (RED) {
  const { setStatus, checkType, setErrorStatus, getNodeParameter } = require('./lib/helpers');
  const { WazoApiClient } = require('@wazo/sdk');

  function create_snoop(config) {
    RED.nodes.createNode(this, config);
    conn = RED.nodes.getNode(config.server);
    this.client = conn.client.application;

    let node = this;
    setStatus(node);

    node.on('input', async (msg, send, done) => {
      const applicationUuid = getNodeParameter(RED, node, msg, config.applicationUuid, config.applicationUuidType) || msg.payload.application_uuid || msg.payload.uuid;
      const callUuid = getNodeParameter(RED, node, msg, config.callUuid, config.callUuidType) || msg.payload.call.id || msg.payload.call_id;
      const snoopingCallUuid = getNodeParameter(RED, node, msg, config.snoopingCallUuid, config.snoopingCallUuidType) || msg.payload.snooping_call_id;
      const whisperMode = getNodeParameter(RED, node, msg, config.whisperMode, config.whisperModeType) || msg.payload.whisper_mode;

      if (checkType(RED, node, applicationUuid, "string") && checkType(RED, node, callUuid, "string") && checkType(RED, node, snoopingCallUuid, "string") && checkType(RED, node, whisperMode, "string")) {
        
        node.log('Create snoop');
        try {
          const snoop = await node.client.createSnoop(applicationUuid, callUuid, snoopingCallUuid, whisperMode);
          
          setStatus(node, `Snoop created for call: ${callUuid}`, "green", "dot");
          msg.payload.application_uuid = applicationUuid;
          msg.payload.call_id = callUuid;
          msg.payload.snooping_call_id = snoopingCallUuid;
          msg.payload.whisper_mode = whisperMode;
          msg.payload.snoop = snoop;
          node.send(msg);
        }
        catch(err) {
          setErrorStatus(node, "Snoop could not be started, check inputs")    
          node.error(err);
          throw err;
        }
      }
      done();
    });

  }

  RED.nodes.registerType("wazo create_snoop", create_snoop);

};