import DataTable from 'datatables.net-dt';
import 'datatables.net-rowgroup-dt';
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
    return new Date(ingestTime).toLocaleString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
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
        const validTime = extractTimestampFromKey(record.fileName).toLocaleString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
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
    const collapsedGroups = {};
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
        order: [[0, 'asc'], [2, 'asc']],
        orderFixed: [[0, 'asc']],
        lengthMenu: [-1, 10, 25, 50],
        layout: {
            topStart: null,
            topEnd: null,
            top2Start: 'pageLength',
            top2End: 'search',
            top: function () {
                const div = document.createElement('div');
                div.className = 'dt-controls';
                div.innerHTML = `
                    <button class="btn success" onclick="">Play</button>
                    <button id="select-all-btn" class="btn primary" onclick="selectionManager.toggleSelectAll()">Select All</button>
                    <button class="btn danger" onclick="">Delete</button>
                `;
                return div;
            },
            bottomStart: 'info',
            bottomEnd: 'paging'
        },
        createdRow: function(row, data) {
            row.dataset.key = data[1];
        },
        rowGroup: {
            dataSrc: 0,
            startRender: function(rows, group) {
                const collapsed = !!collapsedGroups[group];
                const icon = collapsed ? '▶' : '▼';

                rows.nodes().each(function(r) {
                    if (collapsed) {
                        r.classList.add('collapsed-row');
                    } else {
                        r.classList.remove('collapsed-row');
                    }
                });

                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="8"><span class="group-icon">${icon}</span> ${group} (${rows.count()})</td>`;
                tr.dataset.name = group;
                tr.classList.add('group-start');
                if (collapsed) {
                    tr.classList.add('collapsed');
                }

                return tr;
            }
        }
    });

    selectionManager = new SelectionManager(dataTable, collapsedGroups);
    globalThis.selectionManager = selectionManager;

    document.getElementById('database-manager').classList.add('hidden');
});

/* React to DB changes */
document.addEventListener('db-change', () => {
    refreshDataFromDB();
});