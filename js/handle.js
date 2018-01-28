let HANDLE = {
    getSelection: function() {
        return EDITOR.selection;
    },
    setSelection: function(sel) {
        HANDLE.clearSelection();
        for (let item of sel)
        {
            HANDLE.select(item);
        }
    },
    clearSelection: function() {
        for (let item of HANDLE.getSelection())
        {
            HANDLE.unselect(item);
        }
    },
    select: function(item) {
        EDITOR.select(item);
    },
    unselect: function(item) {
        EDITOR.unselect(item);
    },
    submit: function() {
        // Note: called internally
    },
    gotoItem: function (name)
    {
        if (name && name.length > 0)
        {
            EDITOR.focusItem(name);
        }
        else
        {
            alert("Please enter a name!");
        }
    },
    setNodeBehavior: function (behavior) {
        EDITOR.setNodeBehavior(behavior);
    },
    displaySelection: function () {
        let sel = this.getSelection();
        alert([... sel].join(",\n"));
    }
} 
