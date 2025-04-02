/**
 * Builds a model based on the provided Lindsey data.
 *
 * @param {Object} lindseyData - The input data used to construct the model.
 * @returns {Object} An object representing the constructed model.
 */
export const buildModel = (lindseyData) => {

    let idIncrement = 1;
    const objectGroup = [];

    Object.keys(lindseyData).forEach((property, index) => {
        const mainObject = lindseyData[property];

        const group = {
            id: idIncrement.toString(),
            object_name: property,
            relations: [],
        };

        // node model builder
        Object.keys(mainObject).forEach((component) => {
            if (
                typeof mainObject[component] === "object" &&
                Object.entries(mainObject[component]).length > 0
            ) {
                Object.keys(mainObject[component]).forEach((child) => {
                    const objectData = mainObject[component][child];

                    let xCoordinate = 400 * index;
                    let yCoordinate = 200;

                    switch (objectData["data_group"]) {
                        case "properties":
                            yCoordinate *= -0.5;
                            group.relations.push({
                                id: idIncrement.toString(),
                                type: objectData["data_group"],
                            });
                            break;
                        case "children":
                            yCoordinate *= 2.5;
                            group.relations.push({
                                id: idIncrement.toString(),
                                type: objectData["data_group"],
                            });
                            break;
                        default:
                            break;
                    }

                    const nodeObject = {
                        id: idIncrement.toString(),
                        data: { label: objectData["table_name"], main: objectData["data_group"] == "main" ? true : false, metadata: mainObject },
                        position: { x: xCoordinate, y: yCoordinate },
                    };

                    // Get existing data from localStorage
                    const nodeModelCompute = localStorage.getItem("node-model");
                    const existingNode = nodeModelCompute ? JSON.parse(nodeModelCompute) : [];

                    // Add new data (assuming newData is an object or array)
                    const updatedNode = [...existingNode, nodeObject];

                    // Store back into localStorage
                    localStorage.setItem("node-model", JSON.stringify(updatedNode));

                    idIncrement++;
                });
            }
        });

        objectGroup.push(group);
    });

    // edge model builder
    objectGroup.forEach((node) => {
        const { properties, children } = node.relations.reduce(
            (acc, relation) => {
                acc[relation.type] = (acc[relation.type] || 0) + 1;
                return acc;
            },
            {}
        );

        node.relations.forEach((relation) => {
            let label, id, source, target;

            switch (relation.type) {
                case "properties":
                    label = properties || 1;
                    id = `${relation.id}->${node.id}`;
                    source = relation.id;
                    target = node.id;
                    break;
                case "children":
                    label = children || 1;
                    id = `${node.id}->${relation.id}`;
                    source = node.id;
                    target = relation.id;
                    break;
                default:
                    break;
            }

            const edgeModelCompute = localStorage.getItem("edge-model");
            const existingEdge = edgeModelCompute ? JSON.parse(edgeModelCompute) : [];

            const updatedEdge = [...existingEdge, {
                label: label,
                id: id,
                source: source,
                target: target,
                animated: true,
            }];

            localStorage.setItem("edge-model", JSON.stringify(updatedEdge));

        });
    });


}