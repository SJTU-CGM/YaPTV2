"use strict";


let TREE = null;
let LAYOUT = null;
let LAYOUT_PARAMETER = null;
let EDITOR = null;
let CONTAINER = null;
let ELEMENT = null;
let ROOT = null;


function getLeafByName(name) {
    return ROOT.share.nodeByName[name];
}


class Editor {
    // connect user input to tree modification.
    constructor(onSelectionChange) {
        this.selection = new Set();
        this.hiddenChildren = new Set();
        this.onSelectionChange = onSelectionChange;
        this.mode = "fold";
    }
    setNodeBehavior(behavior) {
        let that = this;
        function setAsFold()
        {
            function S(node) {
                if (node.type == "node")
                {
                    S1(node);
                    for (let n of node.subnodes)
                    {
                        S(n);
                    }
                }
            }
            function S1(node) {
                function show(node) {
                    showSubnodes: {
                        node.elements["body"].style["display"] = "unset";
                        node.elements["vbranch"].style["display"] = "unset";
                    }
                    changeButtonNote: {
                        node.setButtonNote("minus");
                        node.setButtonColorScheme("to-hide");
                    }
                }
                function hide(node) {
                    hideSubNodes: {
                        node.elements["body"].style["display"] = "none";
                        node.elements["vbranch"].style["display"] = "none";
                    }
                    changeButtonNote: {
                        node.setButtonNote("plus");
                        node.setButtonColorScheme("to-show");
                    }
                }
                if (that.hiddenChildren.has(node)) {
                    hide(node);
                }
                else
                {
                    show(node);
                }
            }
            that.mode = "fold";
            S(ROOT);
        }

        function setAsSelect()
        {
            function S(node)
            {
                if (node.type == "node")
                {
                    S1(node);
                    for (let n of node.subnodes)
                    {
                        S(n);
                    }
                }
            }
            function S1(node) {
                node.setButtonNote("dot");
                node.setButtonColorScheme("select")
            }
            that.mode = "select";
            S(ROOT)
        }

        switch (behavior)
        {
            case "fold": setAsFold(); return;
            case "select": setAsSelect(); return;
        }
    }
    isSelected(name) {
        return this.selection.has(name);
    }
    emitSelectionChange() {
        if (this.onSelectionChange) {
            this.onSelectionChange(this.selection);
        }
    }
    select(name) {
        this.selectLeaf(getLeafByName(name));
    }
    unselect(name) {
        this.unselectLeaf(getLeafByName(name));
    }
    selectLeaf(leaf) {
        leaf.setButtonColorScheme("selected");
        this.selection.add(leaf.name);
        this.emitSelectionChange();
    }
    unselectLeaf(leaf) {
        leaf.setButtonColorScheme("normal");
        this.selection.delete(leaf.name);
        this.emitSelectionChange();
    }
    getLeafPosition(name) {
        // get the position { x1, y1 } of the corresponding leaf.
        let leaf = getLeafByName(name);
        return leaf.getPosition();
    }
    focusItem(name)
    {
        let leaf = getLeafByName(name);
        const pos = leaf.getPosition();
        this.focus(pos.x, pos.y);
        leaf.setButtonColorScheme(this.isSelected(name) ? "focused&selected" : "focused");
    }
    focus(x, y) {
        // set the focused point at the center of canvas
        ELEMENT.viewBox.baseVal.x = (x - (ELEMENT.viewBox.baseVal.width / 2));
        ELEMENT.viewBox.baseVal.y = (y - (ELEMENT.viewBox.baseVal.height / 2));
    }


    getLeafClickHandler() {
        let that = this;
        return function (leaf) {
            if (that.isSelected(leaf.name))
            {
                that.unselectLeaf(leaf);
            }
            else
            {
                that.selectLeaf(leaf);
            }
        }
    }


    getNodeClickHandler() {
        function handleFold(node)
        {
            function show(node) {
                showSubnodes: {
                    node.elements["body"].style["display"] = "unset";
                    node.elements["vbranch"].style["display"] = "unset";
                }
                changeButtonNote: {
                    node.setButtonNote("minus");
                    node.setButtonColorScheme("to-hide");
                }
            }
            function hide(node) {
                hideSubNodes: {
                    node.elements["body"].style["display"] = "none";
                    node.elements["vbranch"].style["display"] = "none";
                }
                changeButtonNote: {
                    node.setButtonNote("plus");
                    node.setButtonColorScheme("to-show");
                }
            }
            if (hiddenChildren.has(node))
            {
                hiddenChildren.delete(node);
                show(node);
            }
            else
            {
                hiddenChildren.add(node);
                hide(node);
            }
        }
        function handleSelect(node)
        {
            for (let n of node.getDescendants())
            {
                that.selectLeaf(n);
            }
        }
        let that = this;
        let hiddenChildren = this.hiddenChildren;
        return function (node) {
            if (that.mode == "fold")
            {
                handleFold(node);
            }
            else if (that.mode == "select")
            {
                handleSelect(node);
            }
        }
    }
}


function translateTree(tree) {
    // translate tree to WebPhyloTree style
    if (tree["children"] && tree["children"].length > 0)
    {
        return {
            "length": tree["branch_length"],
            "subnodes": tree["children"].map(translateTree)
        };
    }
    else
    {
        return {
            "name": tree["name"],
            "length": tree["branch_length"]
        };
    }
}


function startYaPTV2() {
    $.ajax({
        url: './conf.json',
        dataType: 'json',
        success: function (conf) {
            LAYOUT = conf["layout"]
            // load tree description
            $.ajax({
                url: conf["tree"],
                dataType: 'json',
                success: function (data) {
                    TREE = translateTree(data);
                    maybeStart();
                },
                error: function (xhr, errorType, error) {
                    console.log('Fail to load tree description, error type:', errorType);
                }
            });
            // load display configuration
            $.ajax({
                url: conf["layout_parameters"],
                dataType: 'json',
                success: function (data) {
                    EDITOR = new Editor(function(sel) { updateSelectionCount(sel.size) });
                    LAYOUT_PARAMETER = Object.assign(data, {
                        "leaf_button::onclick": EDITOR.getLeafClickHandler(),
                        "node_button::onclick": EDITOR.getNodeClickHandler()
                    });
                    maybeStart();
                },
                error: function (xhr, errorType, error) {
                    console.log('Fail to load layout parameters, error type:', errorType);
                }
            });
        },
        error: function (xhr, errorType, error) {
            console.log('Fail to load configuration file ("conf.json"), error type:', errorType);
        }
    });
}


function maybeStart() {
    if (TREE != null && LAYOUT_PARAMETER != null)
    {
        start();
    }
}


function resizeTree() {
    let w1 = ELEMENT.width.baseVal.value;
    let h1 = ELEMENT.height.baseVal.value;
    let w2 = CONTAINER.offsetWidth;
    let h2 = CONTAINER.offsetHeight;
    ELEMENT.setAttribute("width", CONTAINER.offsetWidth + "px");
    ELEMENT.setAttribute("height", CONTAINER.offsetHeight + "px");
    ELEMENT.viewBox.baseVal.width *= (w2 / w1);
    ELEMENT.viewBox.baseVal.height *= (h2 / h1);
}


function start() {
    let _ = WebPhyloTree.load(LAYOUT, TREE, LAYOUT_PARAMETER, [
        WebPhyloTree.Addons.NodeButton,
        WebPhyloTree.Addons.LeafButton,
        WebPhyloTree.Addons.ExtendBranch,
        WebPhyloTree.Addons.Dragging,
        WebPhyloTree.Addons.Zooming
    ]);
    ELEMENT = _.element;
    ROOT = _.root;
    CONTAINER = document.getElementById("tree");
    resizeTree();
    window.addEventListener("resize", resizeTree);
    CONTAINER.appendChild(ELEMENT);
}


function updateSelectionCount(count) {
    document.getElementById("selection-count").innerHTML = count.toString();
}


$(document).ready(startYaPTV2);




// var tree = WebPhyloTree.load("rectangular", description, {
//         "branch_length_unit": 10,
//         "leaf_span": 50,
//     },
//     [ WebPhyloTree.Addons.LeafButton, WebPhyloTree.Addons.ExtendBranch ]
// );


// document.getElementsByTagName("body")[0].appendChild(tree.element);
