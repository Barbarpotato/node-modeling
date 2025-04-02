import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Function to initialize and return the database connection
export async function openDb() {
    return open({
        filename: './data/database.db', // Path to your SQLite file
        driver: sqlite3.Database,
    });
}

export async function initializeDb() {
    const db = await openDb();
    try {
        // Create Raw_Data table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS Raw_Data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_name TEXT,
            created TEXT,
            data TEXT
            )
        `);

        // Create node table with foreign key
        await db.exec(`
            CREATE TABLE IF NOT EXISTS node (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            raw_data INTEGER,
            project_name VARCHAR(255),
            node_name VARCHAR(255),
            created TEXT,
            file LONGTEXT,
            FOREIGN KEY (raw_data) REFERENCES Raw_Data(id) ON DELETE CASCADE
            )
        `);

    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
    return db;
}


export async function clearDb() {
    const db = await openDb();
    try {
        // Enable foreign key support
        await db.exec('PRAGMA foreign_keys = ON');

        // Delete all data from node table
        await db.run('DELETE FROM node');

        // Delete all data from Raw_Data table
        await db.run('DELETE FROM Raw_Data');

        // Reset the auto-increment counters (optional)
        await db.run('DELETE FROM sqlite_sequence WHERE name="Raw_Data"');
        await db.run('DELETE FROM sqlite_sequence WHERE name="node"');
    } catch (error) {
        console.error('Failed to clear database:', error);
        throw error;
    } finally {
        await db.close();
    }
}