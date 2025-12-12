export class SelectionManager {
    constructor(dataTable, collapsedGroups) {
        this.dataTable = dataTable;
        this.anchorIndex = null;
        this.currentIndex = null;

        this.collapsedGroups = collapsedGroups;

        this.#bindClickHandler();
        this.#bindKeyboardHandler();
    }

    getSelectedKeys() {
        const selectedRows = this.dataTable.rows('.selected').data();
        return selectedRows.toArray().map(r => r[1]);
    }

    clearSelection() {
        this.#clearAllSelections();
        this.anchorIndex = null;
        this.currentIndex = null;
    }

    #bindClickHandler() {
        this.dataTable.on('click', 'tbody tr', (e) => {
            const row = e.currentTarget;

            if (row.classList.contains('group-start')) {
                this.#handleGroupClick(row);
                return;
            }

            const rowIndex = this.dataTable.row(row).index();

            if (rowIndex === undefined) return;

            const isSelected = row.classList.contains('selected');

            if (e.shiftKey && this.anchorIndex !== null) {
                this.#handleShiftClick(rowIndex, e.ctrlKey || e.metaKey);
            } else if (e.ctrlKey || e.metaKey) {
                this.#handleCtrlClick(row, rowIndex);
            } else {
                this.#handleSingleClick(row, rowIndex, isSelected);
            }
        });
    }

    #handleGroupClick(groupRow) {
        const name = groupRow.dataset.name;
        this.collapsedGroups[name] = !this.collapsedGroups[name];
        this.dataTable.draw(false);
    }

    #bindKeyboardHandler() {
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape") {
                this.#clearAllSelections();
                return;
            }

            if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return;

            const hasSelection = this.dataTable.rows('.selected').nodes().length > 0;
            if (!hasSelection) return;

            e.preventDefault();

            const direction = e.key === 'ArrowDown' ? 1 : -1;

            if (e.shiftKey) {
                this.#extendSelection(direction);
            } else {
                this.#moveSelection(direction);
            }
        });
    }

    #handleShiftClick(rowIndex, preserveExisting) {
        this.#selectRange(this.anchorIndex, rowIndex, preserveExisting);
        this.currentIndex = rowIndex;
    }

    #handleCtrlClick(row, rowIndex) {
        row.classList.toggle('selected');
        this.anchorIndex = rowIndex;
        this.currentIndex = rowIndex;
    }

    #handleSingleClick(row, rowIndex, isSelected) {
        if (isSelected) {
            row.classList.remove('selected');
            this.anchorIndex = null;
            this.currentIndex = null;
        } else {
            this.#clearAllSelections();
            row.classList.add('selected');
            this.anchorIndex = rowIndex;
            this.currentIndex = rowIndex;
        }
    }

    #extendSelection(direction) {
        this.currentIndex = this.#clampIndex(this.currentIndex + direction);
        this.#selectRange(this.anchorIndex, this.currentIndex);
        this.#scrollToRow(this.currentIndex);
    }

    #moveSelection(direction) {
        this.currentIndex = this.#clampIndex(this.currentIndex + direction);
        this.#clearAllSelections();
        this.dataTable.row(this.currentIndex).node().classList.add('selected');
        this.anchorIndex = this.currentIndex;
        this.#scrollToRow(this.currentIndex);
    }

    #selectRange(from, to, preserveExisting = false) {
        const start = Math.min(from, to);
        const end = Math.max(from, to);

        if (!preserveExisting) {
            this.#clearAllSelections();
        }

        for (let i = start; i <= end; i++) {
            this.dataTable.row(i).node().classList.add('selected');
        }
    }

    #clearAllSelections() {
        this.dataTable.rows('.selected').nodes().each((r) => r.classList.remove('selected'));
    }

    #clampIndex(index) {
        const totalRows = this.dataTable.rows().count();
        return Math.max(0, Math.min(index, totalRows - 1));
    }

    #scrollToRow(index) {
        this.dataTable.row(index).node().scrollIntoView({ block: 'nearest' });
    }
}