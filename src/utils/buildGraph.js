// Fetch dependency data from the API
async function fetchDependencyData(nodeName, raw_data_id) {
    try {
        const response = await fetch(`/api/node/graph?node_name=${nodeName}&raw_data_id=${raw_data_id}`);
        const data = await response.json();
        return data.relevantFunctions;
    } catch (error) {
        console.error(`Error fetching data for node_name '${nodeName}': ${error.message}`);
        return [];
    }
}

// Helper to determine the order of dependency calls in the code
function getDependencyCallOrder(code, dependencies) {
    const callOrder = [];
    let callCounter = 1; // To number the calls

    // Map dependencies to their method names for easier lookup
    const depMap = dependencies.reduce((acc, dep) => {
        const key = `${dep.engineName}.${dep.methodName}`;
        acc[key] = { dep, callNumber: null };
        return acc;
    }, {});

    // Find all occurrences of dependency calls in the code
    Object.keys(depMap).forEach((key) => {
        const [engineName, methodName] = key.split('.');
        let regex;
        if (engineName === "Self") {
            regex = new RegExp(`\\$this->${methodName}\\s*\\(`, 'g');
        } else {
            regex = new RegExp(`\\$${engineName}->${methodName}\\s*\\(`, 'g');
        }

        let match;
        while ((match = regex.exec(code)) !== null) {
            callOrder.push({ key, index: match.index, callNumber: callCounter++ });
        }
    });

    // Sort by call index to get the order of execution
    callOrder.sort((a, b) => a.index - b.index);

    // Assign call numbers to dependencies
    callOrder.forEach(({ key, callNumber }) => {
        depMap[key].callNumber = callNumber;
    });

    // Rebuild the dependencies array in call order
    const orderedDependencies = [];
    const calledKeys = new Set(callOrder.map(({ key }) => key));
    callOrder.forEach(({ key }) => {
        if (!orderedDependencies.some(dep => `${dep.engineName}.${dep.methodName}` === key)) {
            orderedDependencies.push(depMap[key].dep);
        }
    });

    // Add any dependencies that weren't called directly
    const remainingDeps = dependencies.filter(dep => {
        const key = `${dep.engineName}.${dep.methodName}`;
        return !calledKeys.has(key);
    });

    return { orderedDependencies: [...orderedDependencies, ...remainingDeps], depMap };
}

/**
 * Builds a React Flow schema (nodes and edges) based on dependency data.
 *
 * @param {string} nodeName - The name of the node to fetch data for (e.g., "wallet_journal").
 * @returns {Promise<Object>} An object containing nodes and edges for React Flow.
 */
export const buildDependencyFlow = async (nodeName, raw_data_id) => {
    const relevantFunctions = await fetchDependencyData(nodeName, raw_data_id);
    if (!relevantFunctions.length) {
        return { nodes: [], edges: [] };
    }

    let idIncrement = 1;
    const nodes = [];
    const edges = [];
    const functionGroup = [];

    // Build nodes and group functions
    relevantFunctions.forEach((func, index) => {
        const group = {
            id: idIncrement.toString(),
            functionName: func.functionName,
            relations: [],
        };

        // Main function node
        const mainX = 600 * index;
        const mainNode = {
            id: idIncrement.toString(),
            data: { label: func.functionName, main: true, metadata: { code: func.code } },
            position: { x: mainX, y: 0 },
        };
        nodes.push(mainNode);
        idIncrement++;

        // Reorder dependencies based on execution order and get call numbers
        const { orderedDependencies, depMap } = getDependencyCallOrder(func.code, func.dependencies);

        // Split into Self and engine dependencies
        const selfDeps = orderedDependencies.filter(dep => dep.engineName === "Self");
        const engineDeps = orderedDependencies.filter(dep => dep.engineName !== "Self");

        // Position Self dependencies (below, left to right based on execution order)
        selfDeps.forEach((dep, depIndex) => {
            const depId = idIncrement.toString();
            const xOffset = depIndex * 150;
            const depX = mainX + xOffset - (selfDeps.length - 1) * 75;

            const depNode = {
                id: depId,
                data: {
                    label: `${dep.engineName}.${dep.methodName}`,
                    main: false,
                    metadata: { code: dep.code || "Not available" }
                },
                position: { x: depX, y: 150 },
            };
            nodes.push(depNode);

            group.relations.push({
                id: depId,
                type: "self",
                depKey: `${dep.engineName}.${dep.methodName}`,
            });

            idIncrement++;
        });

        // Position engine dependencies (above, left to right based on execution order)
        engineDeps.forEach((dep, depIndex) => {
            const depId = idIncrement.toString();
            const xOffset = depIndex * 150;
            const depX = mainX + xOffset - (engineDeps.length - 1) * 75;

            const depNode = {
                id: depId,
                data: {
                    label: `${dep.engineName}.${dep.methodName}`,
                    main: false,
                    metadata: { code: dep.code || "Not available" }
                },
                position: { x: depX, y: -150 },
            };
            nodes.push(depNode);

            group.relations.push({
                id: depId,
                type: "engine",
                depKey: `${dep.engineName}.${dep.methodName}`,
            });

            idIncrement++;
        });

        functionGroup.push(group);
    });

    // Build edges with numbered labels
    functionGroup.forEach((group) => {
        const mainNodeId = group.id;

        // Track call numbers for this function's dependencies
        const { depMap } = getDependencyCallOrder(
            relevantFunctions.find(func => func.functionName === group.functionName).code,
            relevantFunctions.find(func => func.functionName === group.functionName).dependencies
        );

        group.relations.forEach((relation) => {
            let label, id, source, target;

            switch (relation.type) {
                case "self":
                    label = "calls";
                    id = `${mainNodeId}->${relation.id}`;
                    source = mainNodeId;
                    target = relation.id;
                    break;
                case "engine":
                    label = "uses";
                    id = `${mainNodeId}->${relation.id}`;
                    source = mainNodeId;
                    target = relation.id;
                    break;
                default:
                    break;
            }

            if (label) {
                const callNumber = depMap[relation.depKey]?.callNumber;
                const numberedLabel = callNumber ? `${label} #${callNumber}` : label;

                edges.push({
                    id,
                    source,
                    target,
                    label: numberedLabel,
                    animated: true,
                    type: "smoothstep",
                    labelStyle: { fontSize: 10, fill: "#555" },
                    labelShowBg: false,
                });
            }
        });
    });

    // Store in localStorage with unique keys
    localStorage.setItem("node-graph-model", JSON.stringify(nodes));
    localStorage.setItem("edge-graph-model", JSON.stringify(edges));

    return { nodes, edges };
};