import { initializeDb, openDb } from '@/libs/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { raw_data } = req.query;

      if (!raw_data) {
        return res.status(400).json({ error: 'Missing required query parameter: raw_data' });
      }

      const rawDataId = parseInt(raw_data, 10);
      if (isNaN(rawDataId) || rawDataId <= 0) {
        return res.status(400).json({ error: 'Invalid raw_data id: must be a positive integer' });
      }

      const db = await openDb();
      await initializeDb();

      const rawDataRecord = await db.get('SELECT id FROM Raw_Data WHERE id = ?', [rawDataId]);
      if (!rawDataRecord) {
        return res.status(404).json({ error: `Raw_Data record with id ${rawDataId} not found` });
      }

      const nodes = await db.all('SELECT * FROM node WHERE raw_data = ?', [rawDataId]);
      res.status(200).json(nodes);
    } catch (error) {
      console.error('Error fetching nodes by raw_data:', error);
      res.status(500).json({ error: 'Failed to fetch nodes: ' + error.message });
    }
  }
  else if (req.method === 'POST') {
    try {
      const { raw_data, created, file, node_name } = req.body;

      // Validate required fields
      if (!raw_data || !created || !node_name) {
        return res.status(400).json({
          error: 'Missing required fields: raw_data, created, and node_name are required',
        });
      }

      const rawDataId = parseInt(raw_data, 10);
      if (isNaN(rawDataId) || rawDataId <= 0) {
        return res.status(400).json({ error: 'Invalid raw_data id: must be a positive integer' });
      }

      const db = await openDb();

      const rawDataRecord = await db.get('SELECT id, project_name FROM Raw_Data WHERE id = ?', [rawDataId]);
      if (!rawDataRecord) {
        return res.status(404).json({ error: `Raw_Data record with id ${rawDataId} not found` });
      }

      // Check for existing node
      const existingNode = await db.get(
        'SELECT * FROM node WHERE node_name = ? AND raw_data = ?',
        [node_name, rawDataId]
      );

      if (existingNode) {
        // Update existing node
        const updateNodeQuery = 'UPDATE node SET file = ?, created = ?, project_name = ? WHERE id = ?';
        await db.run(updateNodeQuery, [
          file || '', // Store file content (could be base64 or text)
          created,
          rawDataRecord.project_name,
          existingNode.id
        ]);

        const updatedNode = await db.get('SELECT * FROM node WHERE id = ?', [existingNode.id]);
        res.status(200).json({
          message: 'Node updated successfully',
          node: updatedNode
        });
      } else {
        // Insert new node
        const insertNodeQuery = 'INSERT INTO node (raw_data, created, file, node_name, project_name) VALUES (?, ?, ?, ?, ?)';
        const result = await db.run(insertNodeQuery, [
          rawDataId,
          created,
          file || '', // Store file content (could be base64 or text)
          node_name,
          rawDataRecord.project_name
        ]);

        const newNodeId = result.lastID;
        if (!newNodeId) {
          throw new Error('Failed to retrieve the ID of the newly inserted node');
        }

        const newNode = await db.get('SELECT * FROM node WHERE id = ?', [newNodeId]);
        res.status(201).json({
          message: 'Node created successfully',
          node: newNode
        });
      }

    } catch (error) {
      console.error('Error processing node:', error);
      res.status(500).json({ error: 'Failed to process node: ' + error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}