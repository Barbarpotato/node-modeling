import { openDb } from '@/libs/db';


export default async function handler(req, res) {
    // Open the database once for reuse across methods
    const db = await openDb();

    if (req.method === 'GET') {
        try {
            // Extract the id from the dynamic route (req.query.id)
            const { id } = req.query;

            // Validate the id parameter
            if (!id) {
                return res.status(400).json({ error: 'Missing required parameter: id' });
            }

            // Ensure the id is a valid number
            const rawDataId = parseInt(id, 10);
            if (isNaN(rawDataId) || rawDataId <= 0) {
                return res.status(400).json({ error: 'Invalid id: must be a positive integer' });
            }

            // Query the Raw_Data table for the record with the specified id
            const rawDataRecord = await db.get('SELECT * FROM Raw_Data WHERE id = ?', [rawDataId]);

            // Check if the record exists
            if (!rawDataRecord) {
                return res.status(404).json({ error: `Raw_Data record with id ${rawDataId} not found` });
            }

            // Return the Raw_Data record
            res.status(200).json(rawDataRecord);
        } catch (error) {
            console.error('Error fetching Raw_Data record:', error);
            res.status(500).json({ error: 'Failed to fetch Raw_Data record: ' + error.message });
        }
    } else if (req.method === 'DELETE') {
        try {
            // Extract the id from the dynamic route (req.query.id)
            const { id } = req.query;

            // Validate the id parameter
            if (!id) {
                return res.status(400).json({ error: 'Missing required parameter: id' });
            }

            // Ensure the id is a valid number
            const rawDataId = parseInt(id, 10);
            if (isNaN(rawDataId) || rawDataId <= 0) {
                return res.status(400).json({ error: 'Invalid id: must be a positive integer' });
            }

            // Check if the Raw_Data record exists
            const rawDataRecord = await db.get('SELECT * FROM Raw_Data WHERE id = ?', [rawDataId]);
            if (!rawDataRecord) {
                return res.status(404).json({ error: `Raw_Data record with id ${rawDataId} not found` });
            }

            // Since ON DELETE CASCADE is set, deleting Raw_Data will automatically delete associated nodes
            // However, if you want to explicitly delete nodes first (optional), you can do this:
            await db.run('DELETE FROM node WHERE raw_data = ?', [rawDataId]);

            // Delete the Raw_Data record
            const result = await db.run('DELETE FROM Raw_Data WHERE id = ?', [rawDataId]);

            // Check if the deletion was successful (changes > 0 means rows were affected)
            if (result.changes === 0) {
                return res.status(500).json({ error: 'Failed to delete Raw_Data record' });
            }

            // Respond with success
            res.status(200).json({ message: `Raw_Data record with id ${rawDataId} and associated nodes deleted successfully` });
        } catch (error) {
            console.error('Error deleting Raw_Data record:', error);
            res.status(500).json({ error: 'Failed to delete Raw_Data record: ' + error.message });
        } finally {
            // Close the database connection
            await db.close();
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}