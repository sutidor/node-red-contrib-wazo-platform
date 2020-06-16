module.exports = function (RED) {
  const { WazoApiClient } = require('@wazo/sdk');
  const fetch = require('node-fetch');
  const https = require("https");

  const agent = new https.Agent({
    rejectUnauthorized: false
  });
    
  function new_call(config) {
    RED.nodes.createNode(this, config);
    this.conn = RED.nodes.getNode(config.server);
    this.app_uuid = config.app_uuid;

    let node = this;
    setStatus(node);

    node.on('input', async (msg, send, done) => {
      setStatus(node, "running");

      const applicationUuid = getNodeParameter(RED, node, msg, config.applicationUuid, config.applicationUuidType) || msg.payload.application_uuid || node.app_uuid;
      const exten = getNodeParameter(RED, node, msg, config.exten, config.extenType) || msg.payload.exten;
      const context = getNodeParameter(RED, node, msg, config.context, config.contextType) || msg.payload.context;
      const autoAnswer = getNodeParameter(RED, node, msg, config.autoAnswer, config.autoAnswerType) || msg.payload.autoanswer || false;
      const displayedCallerIdName = getNodeParameter(RED, node, msg, config.displayedCallerIdName, config.displayedCallerIdNameType) || msg.payload.displayed_caller_id_name || "";
      const displayedCallerIdNumber = getNodeParameter(RED, node, msg, config.displayedCallerIdNumber, config.displayedCallerIdNumberType) || msg.payload.displayed_caller_id_number || "";
      const variables = getNodeParameter(RED, node, msg, config.variables, config.variablesType) || msg.payload.variables || {};
      
      if (checkType(RED, node, applicationUuid, "string") && checkType(RED, node, exten, "string") && checkType(RED, node, context, "string") && checkType(RED, node, autoAnswer, "boolean") && checkType(RED, node, displayedCallerIdName, "string") && checkType(RED, node, displayedCallerIdNumber, "string") && checkType(RED, node, variables, "object")) {
        try {
          const call = {
            exten: exten,
            context: context,
            autoanswer: autoAnswer,
            displayed_caller_id_name: displayedCallerIdName,
            displayed_caller_id_number: displayedCallerIdNumber,
            variables: variables,
          };
          const url = `https://${node.conn.host}:${node.conn.port}/api/calld/1.0/applications/${applicationUuid}/calls`;
          const token = await node.conn.authenticate();
          const new_call = await createNewCall(url, token, call);
          setStatus(node, `Last called: ${exten}`, "green", "dot");
          msg.payload.application_uuid = applicationUuid;
          msg.payload.call_id = new_call.id;
          msg.payload.new_call = new_call;
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

  // FIXME: Remove when SDK will be ready
  const createNewCall = async (url, token, body) => {
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

  RED.nodes.registerType("wazo new_call", new_call);

};