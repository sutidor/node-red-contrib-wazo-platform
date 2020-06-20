module.exports = function (RED) {
  const { setStatus, checkType, setErrorStatus, getNodeParameter } = require('./lib/helpers');
  const { WazoApiClient } = require('@wazo/sdk');

  function delete_snoop(config) {
    RED.nodes.createNode(this, config);
    conn = RED.nodes.getNode(config.server);
    this.client = conn.client.application;

    let node = this;
    setStatus(node);

    node.on('input', async (msg, send, done) => {
      const applicationUuid = getNodeParameter(RED, node, msg, config.applicationUuid, config.applicationUuidType) || msg.payload.application_uuid || msg.payload.uuid;
      const snoopUuid = getNodeParameter(RED, node, msg, config.snoopUuid, config.snoopUuidType) || msg.payload.snoop_uuid;

      if (checkType(RED, node, applicationUuid, "string") && checkType(RED, node, snoopUuid, "string")) {
        
        node.log(`Delete snoop ${snoopUuid}`);
        try {
          const snoop = await node.client.removeSnoop(applicationUuid, snoopUuid);
          
          setStatus(node, `Snoop deleted: ${snoopUuid}`, "green", "dot");
          msg.payload.application_uuid = applicationUuid;
          msg.payload.snoop_uuid = snoopUuid;
          msg.payload.snoop = snoop;
          node.send(msg);
        }
        catch(err) {
          setErrorStatus(node, "Snoop could not be deleted, check inputs")    
          node.error(err);
          throw err;
        }
      }
      done();
    });

  }

  RED.nodes.registerType("wazo delete_snoop", delete_snoop);

};