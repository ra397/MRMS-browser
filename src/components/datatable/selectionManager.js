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

    toggleSelectAll() {
        if (this.#areAllVisibleRowsSelected()) {
            this.clearSelection();
        } else {
            this.selectAllVisibleRows();
        }
    }

    selectAllVisibleRows() {
        const visibleRows = this.dataTable
            .rows()
            .nodes()
            .toArray()
            .filter(row =>
                !row.classList.contains('collapsed-row') &&
                !row.classList.contains('group-start')
            );

        visibleRows.forEach(row => row.classList.add('selected'));

        this.#updateBtnStates();
    }

    clearSelection() {
        this.#clearAllVisibleSelections();
        this.anchorIndex = null;
        this.currentIndex = null;
        this.#updateBtnStates();
    }

    #updateBtnStates() {
        const selectAllBtn = document.getElementById("select-all-btn");

        if (this.#areAllVisibleRowsSelected()) {
            selectAllBtn.textContent = "Unselect All";
        } else {
            selectAllBtn.textContent = "Select All";
        }

        document.dispatchEvent(new CustomEvent('dt-selection-change'));
    }

    #areAllVisibleRowsSelected() {
        const visibleRows = this.dataTable
            .rows()
            .nodes()
            .toArray()
            .filter(row =>
                !row.classList.contains('collapsed-row') &&
                !row.classList.contains('group-start')
            );

        const visibleRowsCount = visibleRows.length;

        if (visibleRowsCount === 0) return false;

        const visibleSelectedRowsCount = visibleRows.filter(row => row.classList.contains('selected')).length;

        return visibleRowsCount === visibleSelectedRowsCount;
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
        this.#updateBtnStates();
    }

    #bindKeyboardHandler() {
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape") {
                this.clearSelection();
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
        let anchor = this.anchorIndex;
        const anchorRow = this.dataTable.row(anchor).node();

        // If anchor is in a collapsed group, find nearest visible anchor toward the clicked row
        if (anchorRow.classList.contains('collapsed-row')) {
            anchorRow.classList.remove('selected');

            const direction = rowIndex > anchor ? 1 : -1;
            anchor = this.#getNextVisibleIndex(anchor, direction);
        }

        this.anchorIndex = anchor;
        this.#selectRange(anchor, rowIndex, preserveExisting);
        this.currentIndex = rowIndex;
        this.#updateBtnStates();
    }

    #handleCtrlClick(row, rowIndex) {
        row.classList.toggle('selected');
        this.anchorIndex = rowIndex;
        this.currentIndex = rowIndex;
        this.#updateBtnStates();
    }

    #handleSingleClick(row, rowIndex, isSelected) {
        if (isSelected) {
            row.classList.remove('selected');
            this.anchorIndex = null;
            this.currentIndex = null;
        } else {
            this.#clearAllVisibleSelections();
            row.classList.add('selected');
            this.anchorIndex = rowIndex;
            this.currentIndex = rowIndex;
        }
        this.#updateBtnStates();
    }

    #extendSelection(direction) {
        const nextIndex = this.#getNextVisibleIndex(this.currentIndex, direction);
        if (nextIndex === this.currentIndex) return;

        this.currentIndex = nextIndex;
        this.#selectRange(this.anchorIndex, this.currentIndex);
        this.#scrollToRow(this.currentIndex);
        this.#updateBtnStates();
    }

    #moveSelection(direction) {
        const nextIndex = this.#getNextVisibleIndex(this.currentIndex, direction);
        if (nextIndex === this.currentIndex) return;

        this.currentIndex = nextIndex;
        this.#clearAllVisibleSelections();
        this.dataTable.row(this.currentIndex).node().classList.add('selected');
        this.anchorIndex = this.currentIndex;
        this.#scrollToRow(this.currentIndex);
        this.#updateBtnStates();
    }

    #selectRange(from, to, preserveExisting = false) {
        const start = Math.min(from, to);
        const end = Math.max(from, to);

        if (!preserveExisting) {
            this.#clearAllVisibleSelections();
        }

        for (let i = start; i <= end; i++) {
            const row = this.dataTable.row(i).node();
            if (!row.classList.contains('collapsed-row')) {
                row.classList.add('selected');
            }
        }
    }

    #getNextVisibleIndex(currentIndex, direction) {
        const totalRows = this.dataTable.rows().count();
        let nextIndex = currentIndex + direction;

        while (nextIndex >= 0 && nextIndex < totalRows) {
            const row = this.dataTable.row(nextIndex).node();
            if (!row.classList.contains('collapsed-row')) {
                return nextIndex;
            }
            nextIndex += direction;
        }

        // No visible row found in that direction, stay at current position
        return currentIndex;
    }

    #clearAllVisibleSelections() {
        const visibleRows = this.dataTable
            .rows()
            .nodes()
            .toArray()
            .filter(row =>
                !row.classList.contains('collapsed-row') &&
                !row.classList.contains('group-start')
            );
        visibleRows.forEach(row => row.classList.remove('selected'));
        this.#updateBtnStates();
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