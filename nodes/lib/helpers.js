module.exports = {
	setErrorStatus: (node, text) => {
		node.status({
			fill: "red",
			shape: "ring",
			text: typeof text === "object" ? JSON.stringify(text) : text,
		});
	},
//ToDo
	setStatus: (node, text, color, shape) => {
		if (!text && !color && !shape) {
			node.status({});
		} else {
			node.status({
				fill: color || "blue",
				shape: shape || "ring",
				text: text || "",
			});
		}
	},
//ToDo
	checkType: (RED, node, parameter, type) => {
		if (typeof parameter !== type) {
			const errorText = "Input is not of type " + type + ", but: " + typeof(parameter);
			node.status({
				fill: "red",
				shape: "ring",
				text: errorText,
			});
			node.log(errorText);
			node.error(errorText);
			return false;
		}
		return true;
	},

	getNodeParameter: (RED, node, msg, field, fieldType) => {
		if(field) {
			return RED.util.evaluateNodeProperty(field, fieldType, node, msg);
		} else {
			return undefined;
		}
	}
};
