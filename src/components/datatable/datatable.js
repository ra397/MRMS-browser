import DataTable from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import { extractTimestampFromKey } from "../../api/api.js";
import { db } from '../../database/db.js';
import { products } from "../../display/config.js";
import { SelectionManager } from './selectionManager.js';
import "./datatable.css";

/* Helpers */
function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatIngestTime(ingestTime) {
    return new Date(ingestTime).toLocaleString();
}

function parseDisplayName(fileKey) {
    const path = fileKey.replace(/\/+$/, "");
    const parts = path.split("/");
    const s3_name = parts[1];
    return products.find(p => p.s3_name === s3_name)?.display_name;
}

/* Main functions: gets all the records from db */
async function loadDataFromDB() {
    const records = await db.getAllRecords();
    return records.map(record => {
        const product = parseDisplayName(record.fileName);
        const s3Name = record.fileName;
        const validTime = extractTimestampFromKey(record.fileName).toLocaleString();
        const ingestTime = formatIngestTime(record.ingestTime);
        const compressedSize = formatBytes(record.compressedSize);
        return [
            product,
            s3Name,
            validTime,
            ingestTime,
            compressedSize,
        ];
    });
}

async function refreshDataFromDB() {
    if (dataTable) {
        const newData = await loadDataFromDB();
        dataTable.clear();
        dataTable.rows.add(newData);
        dataTable.draw();
    }
}

/* Datatable initialization */
let dataTable;
let selectionManager;

document.addEventListener('DOMContentLoaded', async () => {
    const dataSet = await loadDataFromDB();

    dataTable = new DataTable('#datatable', {
        columns: [
            { title: 'Product' },
            { title: 's3Name', visible: false },
            { title: 'Valid Time' },
            { title: 'Ingest Time' },
            { title: 'Memory Usage' },
        ],
        data: dataSet,
        createdRow: function(row, data, dataIndex) {
            row.dataset.key = data[1];
        }
    });

    selectionManager = new SelectionManager(dataTable);

    document.getElementById('database-manager').classList.add('hidden');
});

/* React to DB changes */
document.addEventListener('db-change', () => {
    refreshDataFromDB();
});