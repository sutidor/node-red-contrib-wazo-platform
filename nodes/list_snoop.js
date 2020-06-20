module.exports = function (RED) {
  const { setStatus, checkType, setErrorStatus, getNodeParameter } = require('./lib/helpers');
  const { WazoApiClient } = require('@wazo/sdk');

  function list_snoop(config) {
    RED.nodes.createNode(this, config);
    conn = RED.nodes.getNode(config.server);
    this.client = conn.client.application;

    let node = this;
    setStatus(node);

    node.on('input', async (msg, send, done) => {
      const applicationUuid = getNodeParameter(RED, node, msg, config.applicationUuid, config.applicationUuidType) || msg.payload.application_uuid;

      if (checkType(RED, node, applicationUuid, "string")) {
        node.log('List snoop');
        try {
          const snoops = await node.client.listSnoop(application_uuid);

          setStatus(node, `Last applications snoops listed: ${applicationUuid}`, "green", "dot");  
          msg.payload.application_uuid = applicationUuid;
          msg.payload.snoops = snoops;
          node.send(msg);
        }
        catch(err) {
          setErrorStatus(node, "Snoops of application could not be listed, check inputs")    
          node.error(err);
          throw err;
        }
      }
      done();
    });

  }

  RED.nodes.registerType("wazo list_snoop", list_snoop);

};