module.exports = function (RED) {
  const { setStatus, checkType, setErrorStatus, getNodeParameter } = require('./lib/helpers');
  const { WazoApiClient } = require('@wazo/sdk');

  function view_snoop(config) {
    RED.nodes.createNode(this, config);
    conn = RED.nodes.getNode(config.server);
    this.client = conn.client.application;

    let node = this;
    setStatus(node);

    node.on('input', async (msg, send, done) => {
      const applicationUuid = getNodeParameter(RED, node, msg, config.applicationUuid, config.applicationUuidType) || msg.payload.application_uuid || msg.payload.uuid;
      const snoopUuid = getNodeParameter(RED, node, msg, config.snoopUuid, config.snoopUuidType) || msg.payload.snoop_uuid;

      if (checkType(RED, node, applicationUuid, "string") && checkType(RED, node, snoopUuid, "string")) {
        
        node.log(`View snoop ${snoopUuid}`);
        try {
          const snoop = await node.client.viewSnoop(applicationUuid, snoopUuid);

          setStatus(node, `Snoop viewed: ${snoopUuid}`, "green", "dot");
          msg.payload.application_uuid = applicationUuid;
          msg.payload.snoop_uuid = snoopUuid;
          msg.payload.snoop = snoop;
          node.send(msg);
        }
        catch(err) {
          setErrorStatus(node, "Snoop could not be viewed, check inputs")    
          node.error(err);
          throw err;
        }
      }
      done();
    });

  }

  RED.nodes.registerType("wazo view_snoop", view_snoop);

};