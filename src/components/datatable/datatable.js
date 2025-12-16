import DataTable from 'datatables.net-dt';
import 'datatables.net-rowgroup-dt'; // grouping rows
import {extractTimestampFromKey} from "../../api/api.js";
import {db, emitDBChange} from '../../database/db.js';
import {products} from "../../display/config.js";
import {SelectionManager} from './selectionManager.js';
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
let isLoading = false;

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
        lengthMenu: [-1, 10, 25, 50], // DO NOT REMOVE
        layout: {
            topStart: null,
            topEnd: null,
            top2Start: null,
            top2End: null,
            bottomStart: null,
            bottomEnd: null,
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

    document.dispatchEvent(new CustomEvent('datatable-ready'));
});

/* React to DB changes */
document.addEventListener('db-change', () => {
    refreshDataFromDB();
});

/* React to selection changes from selectionManager.js */
document.addEventListener("dt-selection-change", () => {
    updateActionButtonState();
});

function updateActionButtonState() {
    const playBtn = document.getElementById('play-files-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const hasSelection = selectionManager.getSelectedKeys().length > 0;

    playBtn.disabled = !hasSelection || isLoading;
    deleteBtn.disabled = !hasSelection || isLoading;
}

/* On click handlers for datatable buttons */
document.addEventListener('datatable-ready', async () => {
    updateActionButtonState();
    document.getElementById("play-files-btn").addEventListener('click', async () => {
        const keys = selectionManager.getSelectedKeys();
        if (keys.length === 0) return;

        isLoading = true;
        updateActionButtonState();

        keys.sort((a, b) => {
            const timestampA = extractTimestampFromKey(a).toISOString();
            const timestampB = extractTimestampFromKey(b).toISOString();
            return timestampA.localeCompare(timestampB);
        });

        document.dispatchEvent(new CustomEvent('display-reset'));

        document.dispatchEvent(new CustomEvent('files-total', {
            detail: {
                total: keys.length,
                fileNames: keys
            },
        }));

        for (const key of keys) {
            const file_data = await db.getDecodedData(key);
            const product_name = key.split("/")[1];

            document.dispatchEvent(new CustomEvent('display-file', {
                detail: {
                    product_name: product_name,
                    file_data: file_data,
                    file_name: key,
                },
            }));
        }

        isLoading = false;
        updateActionButtonState();
    });

    document.getElementById('select-all-btn').addEventListener('click', () => {
        selectionManager.toggleSelectAll();
    });

    document.getElementById('delete-btn').addEventListener('click', async () => {
        const keys = selectionManager.getSelectedKeys();
        if (keys.length === 0) return;

        isLoading = true;
        updateActionButtonState();

        await db.deleteFiles(keys);

        isLoading = false;
        updateActionButtonState();

        emitDBChange();
    });
});