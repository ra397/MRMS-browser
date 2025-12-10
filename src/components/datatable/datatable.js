import DataTable from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';

const dataSet = [
    ["Q3 Multi-Sensor 1 hr (Pass 1)", "12/09/2025 12:00:00", "12/09/2025 16:04:35", "112 KB"]
];

document.addEventListener('DOMContentLoaded', () => {
    const dataTable = new DataTable('#datatable', {
        columns: [
            { title: 'Product' },
            { title: 'Valid Time' },
            { title: 'Ingest Time' },
            { title: 'Memory Usage' },
        ],
        data: dataSet
    });
    document.getElementById('database-manager').classList.add('hidden');
});