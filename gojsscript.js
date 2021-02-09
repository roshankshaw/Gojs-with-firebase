// Custom DraggingTool for dragging fields instead of whole Parts.
// FieldDraggingTool.fieldTemplate needs to be set to a template of the field that you want shown while dragging.
function FieldDraggingTool() {
    go.DraggingTool.call(this);
    this.fieldTemplate = null;  // THIS NEEDS TO BE SET before a drag starts
    this.temporaryPart = null;
    console.log("Hi");
}
go.Diagram.inherit(FieldDraggingTool, go.DraggingTool);

// override this method
FieldDraggingTool.prototype.findDraggablePart = function() {
    var diagram = this.diagram;
    var obj = diagram.findObjectAt(diagram.lastInput.documentPoint);
    while (obj !== null && obj.type !== go.Panel.TableRow) obj = obj.panel;
    if (obj !== null && obj.type === go.Panel.TableRow &&
        this.fieldTemplate !== null && this.temporaryPart === null) {
        var tempPart =
        go.GraphObject.make(go.Node, "Table",
            { layerName: "Tool", locationSpot: go.Spot.Center },
            this.fieldTemplate.copy());  // copy the template!
        this.temporaryPart = tempPart;
        // assume OBJ is now a Panel representing a field, bound to field data
        // update the temporary Part via data binding
        tempPart.location = diagram.lastInput.documentPoint;  // need to set location explicitly
        diagram.add(tempPart);  // add to Diagram before setting data
        tempPart.data = obj.data;  // bind to the same field data as being dragged
        return tempPart;
    }
    return go.DraggingTool.prototype.findDraggablePart.call(this);
};

FieldDraggingTool.prototype.doActivate = function() {
    if (this.temporaryPart === null) return go.DraggingTool.prototype.doActivate.call(this);
    var diagram = this.diagram;
    this.standardMouseSelect();
    this.isActive = true;
    // instead of the usual result of computeEffectiveCollection, just use the temporaryPart alone
    var map = new go.Map(/*go.Part, go.DraggingInfo*/);
    map.set(this.temporaryPart, new go.DraggingInfo(diagram.lastInput.documentPoint.copy()));
    this.draggedParts = map;
    this.startTransaction("Drag Field");
    diagram.isMouseCaptured = true;
};

FieldDraggingTool.prototype.doDeactivate = function() {
    if (this.temporaryPart === null) return go.DraggingTool.prototype.doDeactivate.call(this);
    var diagram = this.diagram;
    // make sure the temporary Part is no longer in the Diagram
    diagram.remove(this.temporaryPart);
    this.temporaryPart = null;
    // now do all the standard deactivation cleanup,
    // including setting isActive = false, clearing out draggedParts, calling stopTransaction(),
    // and setting diagram.isMouseCaptured = false
    go.DraggingTool.prototype.doDeactivate.call(this);
};

FieldDraggingTool.prototype.doMouseMove = function() {
    if (!this.isActive) return;
    if (this.temporaryPart === null) return go.DraggingTool.prototype.doMouseMove.call(this);
    var diagram = this.diagram;
    // just move the temporaryPart (in draggedParts), without regard to moving or copying permissions of the Node
    var offset = diagram.lastInput.documentPoint.copy().subtract(diagram.firstInput.documentPoint);
    this.moveParts(this.draggedParts, offset, false);
};

FieldDraggingTool.prototype.doMouseUp = function() {
    if (!this.isActive) return;
    if (this.temporaryPart === null) return go.DraggingTool.prototype.doMouseUp.call(this);
    var diagram = this.diagram;
    var data = this.temporaryPart.data;
    var dest = diagram.findPartAt(diagram.lastInput.documentPoint, false);
    if (dest !== null && dest.data && dest.data.fields) {
        var panel = dest.findObject("TABLE");
        var idx = panel.findRowForLocalY(panel.getLocalPoint(diagram.lastInput.documentPoint).y);
        diagram.model.insertArrayItem(dest.data.fields, idx + 1,
        { name: data.name, info: data.info, color: data.color, figure: data.figure });
    }
    var src = this.currentPart;
    // whether or not there was a destination node, delete the original field
    if (!(diagram.lastInput.control || diagram.lastInput.meta)) {
        var sidx = src.data.fields.indexOf(data);
        if (sidx >= 0) {
        diagram.model.removeArrayItem(src.data.fields, sidx);
        }
    }
    this.transactionResult = "Inserted Field";
    this.stopTool();
};
// end of FieldDraggingTool
function firebaseCall(){
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    firebase.initializeApp(firebaseConfig);
   
    // let usersRef = firebase.database().ref('users1');
    // // var newUsersRef = usersRef.push();
    // // newUsersRef.set({
    // //     name: 'John',
    // // });
    // usersRef.once('value').then((snapshot) => {
    //     Object.keys(snapshot.val()).forEach((key) => {
    //             console.log(`Name: ${snapshot.val()[key].name}`);
    //     });
    // });
}
async function firebaseRealTimeLog(){
    let usersRef1 = firebase.database().ref('users1');
    let usersRef2 = firebase.database().ref('users2');
    console.log("User1 Firebase Data:-");
    await usersRef1.once('value').then((snapshot) => {
       if(snapshot.exists()){
            Object.keys(snapshot.val()).forEach((key) => {
                    console.log(`Name: ${snapshot.val()[key].name}`);
            });
        }
        else{
            console.log("No records exists");
        }
    });
    console.log("User2 Firebase Data:-");
    await usersRef2.once('value').then((snapshot) => {
        if(snapshot.exists()){
            Object.keys(snapshot.val()).forEach((key) => {
                    console.log(`Name: ${snapshot.val()[key].name}`);
            });
        }
        else{
            console.log("No records exists");
        }
    });

}
function firebaseUpdate(nodeDataArray){
    let usersRef1 = firebase.database().ref('users1');
    let usersRef2 = firebase.database().ref('users2');
    usersRef1.remove();
    usersRef2.remove();
    let users1Data=nodeDataArray[0].fields;
    let users2Data=nodeDataArray[1].fields;
    let newUsersRef=null;
    users1Data.forEach((data)=>{
        newUsersRef = usersRef1.push();
        newUsersRef.set({
            name: data.name,
        });
    });
    users2Data.forEach((data)=>{
        newUsersRef = usersRef2.push();
        newUsersRef.set({
            name: data.name,
        });
    });
    
}

function init() {
    if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
    var $ = go.GraphObject.make;  // for conciseness in defining templates
    firebaseCall();
    myDiagram =
        $(go.Diagram, "myDiagramDiv",
        {
            validCycle: go.Diagram.CycleNotDirected,  // don't allow loops
            draggingTool: $(FieldDraggingTool),  // use custom DraggingTool
            // automatically update the model that is shown on this page
            "ModelChanged": function(e) { if (e.isTransactionFinished) showModel(); },
            "undoManager.isEnabled": true
        });

    // This template is a Panel that is used to represent each item in a Panel.itemArray.
    // The Panel is data bound to the item object.
    // This template needs to be used by the FieldDraggingTool as well as the Diagram.nodeTemplate.
    var fieldTemplate =
        $(go.Panel, "TableRow",  // this Panel is a row in the containing Table
        new go.Binding("portId", "name"),  // this Panel is a "port"
        {
            background: "transparent",  // so this port's background can be picked by the mouse
            fromSpot: go.Spot.Right,  // links only go from the right side to the left side
            toSpot: go.Spot.Left
        },  // allow drawing links from or to this port
        $(go.Shape,
            { width: 12, height: 12, column: 0, strokeWidth: 2, margin: 4 },
            new go.Binding("figure", "figure"),
            new go.Binding("fill", "color")),
        $(go.TextBlock,
            { margin: new go.Margin(0, 2), column: 1, font: "bold 13px sans-serif" ,editable:true},
            new go.Binding("text", "name").makeTwoWay()),
        $(go.TextBlock,
            { margin: new go.Margin(0, 2), column: 2, font: "13px sans-serif" },
            new go.Binding("text", "info"))
        );

    // the FieldDraggingTool needs a template for what to show while dragging
    myDiagram.toolManager.draggingTool.fieldTemplate = fieldTemplate;

    // This template represents a whole "record".
    myDiagram.nodeTemplate =
        $(go.Node, "Auto",
        {
            movable: false,
            copyable: false,
            deletable: false,
            locationSpot: go.Spot.Center
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        // this rectangular shape surrounds the content of the node
        $(go.Shape,
            { fill: "#EEEEEE" }),
        // the content consists of a header and a list of items
        $(go.Panel, "Vertical",
            // this is the header for the whole node
            $(go.Panel, "Auto",
            { stretch: go.GraphObject.Horizontal },  // as wide as the whole node
            $(go.Shape,
                { fill: "#1570A6", stroke: null }),
            $(go.TextBlock,
                {
                alignment: go.Spot.Center,
                margin: 3,
                stroke: "white",
                textAlign: "center",
                font: "bold 12pt sans-serif",
                },
                new go.Binding("text", "title"))),
            // this Panel holds a Panel for each item object in the itemArray;
            // each item Panel is defined by the itemTemplate to be a TableRow in this Table
            $(go.Panel, "Table",
            {
                name: "TABLE",
                padding: 2,
                minSize: new go.Size(100, 10),
                defaultStretch: go.GraphObject.Horizontal,
                itemTemplate: fieldTemplate
            },
            new go.Binding("itemArray", "fields")
            )  // end Table Panel of items
        )  // end Vertical Panel
    );  // end Node

    myDiagram.model =
        $(go.GraphLinksModel,
        {
            linkFromPortIdProperty: "fromPort",
            linkToPortIdProperty: "toPort",
            linkKeyProperty:"key",
            copiesArrays: true,
            copiesArrayObjects: true,
            nodeDataArray: [
            {
                key: 1,
                title: "Users1",
                fields:[
                    {name: "John", figure: "Ellipse"}
                ],
                loc: "0 0"
            },
            {
                key: 2,
                title: "Users2",
                fields: [
                    {name: "Tom", figure: "Ellipse"}

                ],
                loc: "250 0"
            }
            ]
        });

    showModel();  // show the diagram's initial model

    myDiagram.addModelChangedListener(function(e) {
        if (e.isTransactionFinished) {
            var tx = e.object;
            // console.log(tx.toString());
            // console.log(e.model.nodeDataArray);
            firebaseUpdate(e.model.nodeDataArray);
            firebaseRealTimeLog();
        }
    });
    function showModel() {
        document.getElementById("mySavedModel").textContent = myDiagram.model.toJson();
    }
}