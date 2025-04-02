import { openDb } from '@/libs/db';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // Extract the raw_data id and node_name from query parameters
            const { raw_data_id, node_name } = req.query;

            // Validate the raw_data parameter
            if (!raw_data_id) {
                return res.status(400).json({ error: 'Missing required query parameter: raw_data_id' });
            }

            if (!node_name) {
                return res.status(400).json({ error: 'Missing required query parameter: node_name' });
            }

            // Ensure the raw_data id is a valid number
            const rawDataId = parseInt(raw_data_id, 10);
            if (isNaN(rawDataId) || rawDataId <= 0) {
                return res.status(400).json({ error: 'Invalid raw_data id: must be a positive integer' });
            }

            // Open the database
            const db = await openDb();

            // Validate that the raw_data id exists in Raw_Data table
            const rawDataRecord = await db.get('SELECT * FROM Raw_Data WHERE id = ?', [rawDataId]);
            if (!rawDataRecord) {
                return res.status(404).json({ error: `Raw_Data record with id ${rawDataId} not found` });
            }

            // Parse the raw data
            const data = JSON.parse(rawDataRecord.data);    

            // Get the specific node based on node_name
            const node = data[node_name];

            // Check if the node exists
            if (!node) {
                return res.status(404).json({ error: `Node '${node_name}' not found in raw_data` });
            }

            const response = [];
            Object.keys(node).forEach(component => {

                const componentData = node[component];

                Object.keys(componentData).forEach(object_name => {

                    const objectData = componentData[object_name];
                    const obj = {
                        object_name: objectData['object_name'],
                        field_name: objectData['^field_name'],
                        field_type: objectData['^field_type'],
                    };
                    response.push(obj);
                });

            })

            res.status(200).json(response);

        } catch (error) {
            console.error('Error fetching nodes by raw_data:', error);
            res.status(500).json({ error: 'Failed to fetch nodes: ' + error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}