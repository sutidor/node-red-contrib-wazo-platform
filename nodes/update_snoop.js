module.exports = function (RED) {
  const { setStatus, checkType, setErrorStatus, getNodeParameter } = require('./lib/helpers');
  const { WazoApiClient } = require('@wazo/sdk');

  function update_snoop(config) {
    RED.nodes.createNode(this, config);
    conn = RED.nodes.getNode(config.server);
    this.client = conn.client.application;

    let node = this;
    setStatus(node);

    node.on('input', async (msg, send, done) => {
      const applicationUuid = getNodeParameter(RED, node, msg, config.applicationUuid, config.applicationUuidType) || msg.payload.application_uuid || msg.payload.uuid;
      const snoopUuid = getNodeParameter(RED, node, msg, config.snoopUuid, config.snoopUuidType) || msg.payload.snoop_uuid;
      const whisperMode = getNodeParameter(RED, node, msg, config.whisperMode, config.whisperModeType) || msg.payload.whisper_mode;

      if (checkType(RED, node, applicationUuid, "string") && checkType(RED, node, snoopUuid, "string") && checkType(RED, node, whisperMode, "string")) {
        
        node.log(`Update snoop ${snoop_uuid}`);
        try {
          const snoop = await node.client.updateSnoop(applicationUuid, snoopUuid, whisperMode);
          
          msg.payload.application_uuid = applicationUuid;
          msg.payload.snoop_uuid = snoopUuid;
          msg.payload.whisper_mode = whisperMode;
          msg.payload.snoop = snoop;
          node.send(msg);
        }
        catch(err) {
          setErrorStatus(node, "Snoop could not be updated, check inputs")    
          node.error(err);
          throw err;
        }
      }
      done();
    });

  }

  RED.nodes.registerType("wazo update_snoop", update_snoop);

};