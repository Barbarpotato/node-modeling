import { openDb, initializeDb } from '@/libs/db';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // Open the database
            const db = await openDb();

            // Fetch all records from the Raw_Data table
            const rawData = await db.all('SELECT * FROM Raw_Data');

            // Return the records
            res.status(200).json({ message: 'Success', rawData });
        } catch (error) {
            console.error('Error fetching Raw_Data records:', error);
            res.status(500).json({ error: 'Failed to fetch Raw_Data records: ' + error.message });
        }
    }
    else if (req.method === 'POST') {
        try {

            // Validate request body
            const { data, project_name, created } = req.body;
            if (!data || !project_name || !created) {
                return res.status(400).json({ error: 'Missing required fields: data, project_name, and created are required' });
            }

            // Open the database
            const db = await openDb();

            await initializeDb();

            // Insert into Raw_Data table
            const insertRawDataQuery = 'INSERT INTO Raw_Data (project_name, created, data) VALUES (?, ?, ?)';
            await db.run(insertRawDataQuery, [project_name, created, data]);

            res.status(200).json({ message: 'Success' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to process request: ' + error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}