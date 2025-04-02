// Fetch nodes from your API (returns objects with file content)
async function getFileContents(raw_data_id) {
    const response = await fetch(`http://localhost:3000/api/node?raw_data=${raw_data_id}`);
    const data = await response.json();
    return data; // Returns array of node objects with file, node_name, etc.
}

// Scan all functions in a single file content string
async function scanFile(fileContent) {
    const allFunctions = [];
    try {
        const content = fileContent; // Use the string content directly
        const functionRegex = /function\s+([a-zA-Z0-9_]+)\s*\(.*?\)\s*{/g;
        let match;
        let lastIndex = 0;

        while ((match = functionRegex.exec(content)) !== null) {
            const name = match[1];
            const startIndex = match.index;
            const braceStart = match[0].length + startIndex - 1;
            let braceCount = 1;
            let i = braceStart + 1;

            while (i < content.length && braceCount > 0) {
                if (content[i] === '{') braceCount++;
                if (content[i] === '}') braceCount--;
                i++;
            }

            if (braceCount === 0) {
                const body = content.substring(startIndex, i);
                allFunctions.push({ name, body });
            }
            lastIndex = i;
            functionRegex.lastIndex = lastIndex;
        }
    } catch (error) {
        console.error(`Error processing file content: ${error.message}`);
    }
    return allFunctions;
}

// Extract specific function code from file content
function extractFunctionCode(fileContent, functionName) {
    try {
        const content = fileContent;
        const functionRegex = new RegExp(`function\\s+${functionName}\\s*\\(.*?\\)\\s*{`, 's');
        const match = functionRegex.exec(content);
        if (!match) return null;

        const startIndex = match.index;
        const braceStart = match[0].length + startIndex - 1;
        let braceCount = 1;
        let i = braceStart + 1;

        while (i < content.length && braceCount > 0) {
            if (content[i] === '{') braceCount++;
            if (content[i] === '}') braceCount--;
            i++;
        }

        if (braceCount === 0) {
            return content.substring(startIndex, i);
        }
        return null;
    } catch (error) {
        console.error(`Error processing content for ${functionName}: ${error.message}`);
        return null;
    }
}

// Resolve dependency details (file content and code) using dynamic engineFileMap
async function resolveDependencyDetails(dependency, engineFileMap) {
    if (dependency.engineName === "Self") {
        return dependency; // Code is already fetched if available from the same content
    }

    const engineName = dependency.engineName.replace("_engine", "");
    const fileContent = engineFileMap[engineName];
    if (!fileContent) {
        console.warn(`No file content found for engine: ${engineName}, skipping code fetch`);
        return dependency;
    }

    dependency.code = extractFunctionCode(fileContent, dependency.methodName);
    return dependency;
}

// Build dependency map for engine and $this-> calls
function buildDependencyMap(allFunctions, targetFunctionName = null) {
    const dependencyMap = {};
    const functionNames = allFunctions.map(func => func.name);

    for (const func of allFunctions) {
        if (targetFunctionName && func.name !== targetFunctionName) continue;

        const engines = {};
        const engineLoadRegex = /\$([a-zA-Z0-9_]+_engine)\s*=\s*load_engine\(["']([a-zA-Z0-9_]+)["']/g;
        let match;
        while ((match = engineLoadRegex.exec(func.body)) !== null) {
            engines[match[1]] = match[2];
        }

        const engineCallRegex = /\$([a-zA-Z0-9_]+_engine)->([a-zA-Z0-9_]+)\s*\(/g;
        const engineCalls = [...func.body.matchAll(engineCallRegex)]
            .map(match => ({ engine: match[1], method: match[2] }))
            .filter(call => engines.hasOwnProperty(call.engine));

        const thisCallRegex = /\$this->([a-zA-Z0-9_]+)\s*\(/g;
        const thisCalls = [...func.body.matchAll(thisCallRegex)]
            .map(match => match[1])
            .filter(call => functionNames.includes(call) && call !== func.name);

        const dependencies = [];
        const dependencySet = new Set();

        for (const call of engineCalls) {
            const key = `${call.engine}:${call.method}`;
            if (!dependencySet.has(key)) {
                dependencySet.add(key);
                dependencies.push({
                    engineName: call.engine,
                    methodName: call.method,
                    code: null
                });
            }
        }

        for (const call of thisCalls) {
            const key = `Self:${call}`;
            if (!dependencySet.has(key)) {
                dependencySet.add(key);
                const depFunc = allFunctions.find(f => f.name === call);
                dependencies.push({
                    engineName: "Self",
                    methodName: call,
                    code: depFunc ? depFunc.body : null
                });
            }
        }

        dependencyMap[func.name] = {
            code: func.body,
            dependencies: dependencies
        };
    }

    return dependencyMap;
}

// Main handler function
export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

    const { node_name, function_name, raw_data_id } = req.query;
    if (!node_name) return res.status(400).json({ message: 'node_name is required' });

    try {
        // Step 1: Get all nodes and build engineFileMap with file content
        const allNodes = await getFileContents(raw_data_id);
        if (!allNodes.length) return res.status(404).json({ message: 'No nodes found' });

        // Dynamically create engineFileMap with file content instead of paths
        const engineFileMap = {};
        allNodes.forEach(node => {
            engineFileMap[node.node_name] = node.file; // Use file content directly
        });
        console.log('Dynamic engineFileMap (content keys):', Object.keys(engineFileMap));

        // Step 2: Find the target node
        const targetNode = allNodes.find(node => node.node_name === node_name);
        if (!targetNode) return res.status(404).json({ message: `Node with node_name '${node_name}' not found` });

        const fileContent = targetNode.file;
        if (!fileContent) return res.status(404).json({ message: `No file content found for node '${node_name}'` });
        console.log(`Scanning content for node_name '${node_name}'`);

        // Step 3: Scan functions from the target file content
        const allFunctions = await scanFile(fileContent);
        if (!allFunctions.length) return res.status(404).json({ message: `No functions found in content for ${node_name}` });

        // Step 4: Build dependency map, optionally filtering by function_name
        const dependencyMap = buildDependencyMap(allFunctions, function_name);

        // If function_name was provided but not found, return an error
        if (function_name && !dependencyMap[function_name]) {
            return res.status(404).json({ message: `Function '${function_name}' not found in content for ${node_name}` });
        }

        // Step 5: Resolve dependency code for engine calls using dynamic map
        for (const funcName in dependencyMap) {
            const func = dependencyMap[funcName];
            for (const dep of func.dependencies) {
                await resolveDependencyDetails(dep, engineFileMap);
            }
        }

        // Step 6: Convert map to array for response
        const output = Object.entries(dependencyMap).map(([functionName, details]) => ({
            functionName,
            code: details.code,
            dependencies: details.dependencies.map(dep => ({
                engineName: dep.engineName,
                methodName: dep.methodName,
                code: dep.code
            }))
        }));

        res.status(200).json({ relevantFunctions: output });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing request', error: error.message });
    }
}