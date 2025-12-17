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
        const productDisplayName = parseDisplayName(record.fileName);
        const fileKey = record.fileName;
        const productS3Name = fileKey.split("/")[1];
        const validTime = extractTimestampFromKey(record.fileName).toLocaleString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        const ingestTime = formatIngestTime(record.ingestTime);
        const formattedCompressedSize = formatBytes(record.compressedSize);
        const rawCompressedSize = record.compressedSize;
        return [
            productDisplayName,
            fileKey,
            validTime,
            ingestTime,
            formattedCompressedSize,
            rawCompressedSize,
            productS3Name,
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
            { title: 'fileKey', visible: false }, // Used to set data-key attribute on each table row
            { title: 'Valid Time' },
            { title: 'Ingest Time' },
            { title: 'Memory Usage' },
            { title: 'Raw Memory Usage', visible: false },
            { title: 's3Name', visible: false }, // Used to fix order the data groups
        ],
        columnDefs: [
            { // Order formatted memory usage (97.0 KB, 1.1 MB) by raw memory usage (97000 bytes, 1.1e6 bytes)
                targets: 4,
                orderData: [5],
            },
        ],
        data: dataSet,
        order: [[6, 'asc'], [2, 'asc']],
        orderFixed: [[6, 'asc']],
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
            row.dataset.key = data[1]; // fileKey is used as row key -> maps to key in indexedDB
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

                // Sum compressed storage size for each group
                let groupRawCompressedSize = 0;
                rows.data().each(function (row) {
                    groupRawCompressedSize += row[5];
                });
                const groupFormattedCompressedSize = formatBytes(groupRawCompressedSize);

                const tr = document.createElement('tr');
                tr.innerHTML = `
                  <td colspan="8">
                      <div class="group-header">
                          <span class="group-left"><span class="group-icon">${icon}</span> ${group}</span>
                          <span class="group-size">${groupFormattedCompressedSize}</span>
                      </div>
                  </td>
                `;
                tr.dataset.name = group;
                tr.dataset.total = groupRawCompressedSize;
                tr.classList.add('group-start');
                if (collapsed) {
                    tr.classList.add('collapsed');
                }

                return tr;
            }
        }
    });

    selectionManager = new SelectionManager(dataTable, collapsedGroups);

    document.dispatchEvent(new CustomEvent('datatable-ready'));
});

/* React to DB changes */
document.addEventListener('db-change', async () => {
    await refreshDataFromDB();
    updateTotalStorageDisplayGlobal();
});

/* React to selection changes from selectionManager.js */
document.addEventListener("dt-selection-change", () => {
    updateActionButtonState();
    updateSelectedStorageDisplayPerGroup();
    updateSelectedStorageDisplayGlobal();
});

/* Helpers that update the state of datatable items */
function updateActionButtonState() {
    const playBtn = document.getElementById('play-files-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const hasSelection = selectionManager.getSelectedKeys().length > 0;

    playBtn.disabled = !hasSelection || isLoading;
    deleteBtn.disabled = !hasSelection || isLoading;
}

function getSelectedStorageSizePerGroup() {
    const selectedData = selectionManager.getSelectedData();
    const groupSizes = {};

    selectedData.forEach(row => {
        const group = row[0]; // product name
        const rawBytes = row[5]; // raw compressed size

        if (!groupSizes[group]) {
            groupSizes[group] = 0;
        }
        groupSizes[group] += rawBytes;
    });

    return groupSizes;
}

function updateSelectedStorageDisplayPerGroup() {
    const selectedSizes = getSelectedStorageSizePerGroup();

    const groupRows = document.querySelectorAll('tr.group-start');

    groupRows.forEach(row => {
        const groupName = row.dataset.name;
        const groupSizeSpan = row.querySelector('.group-size');

        const formattedTotalSize = formatBytes(row.dataset.total);

        if (selectedSizes[groupName]) {
            const formattedSelectedSize = formatBytes(selectedSizes[groupName]);
            groupSizeSpan.textContent = `${formattedTotalSize} (${formattedSelectedSize})`;
        } else {
            groupSizeSpan.textContent = formattedTotalSize;
        }
    });
}

function updateTotalStorageDisplayGlobal() {
    const data = dataTable.rows().data().toArray();
    const totalBytes = data.reduce((sum, row) => sum+ row[5], 0);
    document.getElementById('total-storage').textContent = formatBytes(totalBytes);
}

function updateSelectedStorageDisplayGlobal() {
    const selectedData = selectionManager.getSelectedData();
    const selectedBytes = selectedData.reduce((sum, row) => sum + row[5], 0);
    const selectedStorageEl = document.getElementById('selected-storage');

    if (selectedBytes > 0) {
        selectedStorageEl.textContent = `(${formatBytes(selectedBytes)})`;
    } else {
        selectedStorageEl.textContent = '';
    }
}

/* On click handlers for datatable buttons */
document.addEventListener('datatable-ready', async () => {
    updateActionButtonState();
    updateTotalStorageDisplayGlobal();
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