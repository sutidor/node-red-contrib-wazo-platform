module.exports = {
	setErrorStatus: (node, text) => {
		node.status({
			fill: "red",
			shape: "ring",
			text: typeof text === "object" ? JSON.stringify(text) : text,
		});
	},

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

	checkType: (node, parameter, type) => {
		if (typeof parameter !== type) {
			const text = RED._("delete_node.errors.falsetype") + type;
			setErrorStatus(node, text);
		}
	},
};
