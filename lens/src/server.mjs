import express from 'express';
import duckdb from 'duckdb';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { spawn } from 'child_process';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

import rateLimit from 'express-rate-limit';

// Create a rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10000 // limit each IP to 10000 requests per windowMs
});

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const readdir = promisify(fs.readdir);

const app = express();
app.set('trust proxy', 1); // Necessary for caddy / reverse-proxy
const db = new duckdb.Database(process.env.DUCKDB_PATH);
const creatorCon = db.connect();

async function loadAll(dataDir, overwrite = false) {
    console.log('Loading Parquet files');

    const files = await readdir(dataDir);
    const parquetFiles = files.filter(file => file.endsWith('.parquet'));

    try {
        for (const file of parquetFiles) {
        
            await loadParquet(creatorCon, path.join(dataDir, file), overwrite);
        }
    }
    catch (error) {
        console.log('An error occurred while loading Parquet files');
        console.error(error);
    }
    finally {
        console.log('Finished loading Parquet files');
    }
}

async function loadParquet(con, filePath, overwrite = false) {
    const tableName = path.basename(filePath, '.parquet');

    if (overwrite) {
        await con.exec(`DROP TABLE IF EXISTS ${tableName}`);
    }

    await con.exec(`
        CREATE TABLE IF NOT EXISTS ${tableName} AS
        SELECT * FROM parquet_scan('${filePath}')
    `);
}

async function createIndexes() {
    console.log('Creating indexes for duckdb. Requests are served un-indexed for now.');

    try {
        const tables = await new Promise((resolve, reject) => {
            creatorCon.all("SHOW TABLES", (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        for (const table of tables) {
            console.log(`Creating indexes for table ${table.name}`);

            const columns = await new Promise((resolve, reject) => {
                creatorCon.all(`PRAGMA table_info(${table.name})`, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            for (const column of columns) {
                const indexName = `idx_${table.name}_${column.name}`;
                const indexExists = await new Promise((resolve, reject) => {
                    creatorCon.all(`SELECT name FROM sqlite_master WHERE type='index' AND name='${indexName}'`, (err, result) => {
                        if (err) reject(err);
                        else resolve(result.length > 0);
                    });
                });

                if (indexExists) {
                    console.log(`Index ${indexName} already exists, skipping`);
                } else {
                    console.log(`Creating index for column ${column.name} in table ${table.name}`);
                    await new Promise((resolve, reject) => {
                        creatorCon.run(`CREATE INDEX ${indexName} ON ${table.name} (${column.name})`, err => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }
            }
        }
    } 
    catch (error) {
        console.log('An error occurred while creating indexes');
        console.error(error);
    }
    finally {
        console.log('Finished creating indexes');
    }
}

const readonlyCon = db.connect({ read_only: true });

const staticServerPath = process.env.STATIC_SERVER_PATH ? process.env.STATIC_SERVER_PATH + '/' : '';
const areaServerPath = '/' + staticServerPath + process.env.AREA_SERVER_PATH || '/';
app.get(areaServerPath + '/calculate_areas', limiter, (req, res, next) => {
    try {
        const { bounds, dataset, type } = req.query;

        if (!bounds) {
            return res.status(400).json({ error: 'Missing bounds parameter' });
        }

        const boundsArray = bounds.split(',').map(Number);

        // Query DuckDB for the data within the bounding box
        const query = `
            SELECT ${type}, SUM(area_ha) as total_area
            FROM ${dataset}_points
            WHERE y BETWEEN ${boundsArray[1]} AND ${boundsArray[3]} AND x BETWEEN ${boundsArray[0]} AND ${boundsArray[2]}
            GROUP BY ${type}
        `;

        readonlyCon.all(query, (err, areas) => {
            if (err) {
                console.warn(err);
                return res.status(500).json({ error: 'An error occurred' });
            }

            const result = areas.reduce((acc, row) => {
                acc[row[type]] = row.total_area;
                return acc;
            }, {});

            res.json(result);
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
});

const port = process.env.AREA_PORT || 3939;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});


let recreateDatabase = process.env.RECREATE_DATABASE ? process.env.RECREATE_DATABASE === 'true' : false;
// Load all Parquet files without awaiting and then create indexes
loadAll(process.env.PARQUET_PATH, recreateDatabase).catch(console.error)
.then(() => createIndexes()).then(() => creatorCon.close());

const tileServerUrl = process.env.TILE_SERVER_HOST + '/' + 
staticServerPath + (process.env.TILE_SERVER_PATH || '/');
const tileserver = spawn('tileserver-gl-light', ['-c', 'tileserver-config.json', '--public_url', tileServerUrl || '']);

tileserver.stdout.on('data', (data) => {
    console.log(`tileserver-gl-light: ${data}`);
});

tileserver.stderr.on('data', (data) => {
    console.error(`tileserver-gl-light: ${data}`);
});

tileserver.on('close', (code) => {
    console.log(`tileserver-gl-light exited with code ${code}`);
});

const tileServerPath = staticServerPath + (process.env.TILE_SERVER_PATH || '/');
const tileServerPathRewrite = '^/' + tileServerPath;

const tileserverProxy = createProxyMiddleware({
    target: 'http://localhost:8080',
    pathRewrite: {
        [tileServerPathRewrite]: ''
    }
});

app.use('/' + tileServerPath, limiter, tileserverProxy);

app.use('/' + staticServerPath, limiter, express.static(path.join(__dirname, process.env.STATIC_DIR || 'public')));
