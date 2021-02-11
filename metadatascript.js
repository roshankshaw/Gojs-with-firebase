const $ = go.GraphObject.make; 
const onModelChange =async (e)=>{
  let newDataref = firebase.database().ref('data');
  newDataref.set(JSON.parse(e.model.toJson()));
}

function init() {
  firebase.initializeApp(firebaseConfig);
  myDiagram =
    $(go.Diagram, "myDiagramDiv",
      {
        validCycle: go.Diagram.CycleNotDirected,  // don't allow loops
        // For this sample, automatically show the state of the diagram's model on the page
        "ModelChanged": function(e) {
          if (e && e.isTransactionFinished){ 
            onModelChange(e);
            showModel();
          }
        },
        "undoManager.isEnabled": true
      });

  // This template represents a whole "record".
  myDiagram.nodeTemplate = nodeTemplate;
    
  myDiagram.linkTemplate = linkTemplate;

  myDiagram.model = onLoadModel;

  // myDiagram.addModelChangedListener((e) => onModelChange(e));

  showModel(); // to show the model changes on load
}
const fieldTemplate = 
  $(go.Panel, "TableRow",  // this Panel is a row in the containing Table
    new go.Binding("portId", "name"),  // this Panel is a "port"
    {
      background: "transparent",  // so this port's background can be picked by the mouse
      fromSpot: go.Spot.Right,  // links only go from the right side to the left side
      toSpot: go.Spot.Left,
      // allow drawing links from or to this port:
      fromLinkable: true, toLinkable: true
    },
    $(go.TextBlock,
      {
        margin: new go.Margin(5, 5), column: 1, font: "bold 13px sans-serif",
        alignment: go.Spot.Left,
        // and disallow drawing links from or to this text:
        fromLinkable: false, toLinkable: false,
        editable:true
      },
      new go.Binding("text", "name").makeTwoWay()),
    $(go.TextBlock,
      { margin: new go.Margin(0, 5), column: 2, font: "13px sans-serif", alignment: go.Spot.Left,editable:true },
      new go.Binding("text", "info").makeTwoWay())
  );
const linkTemplate = 
  $(go.Link,
    {
      relinkableFrom: true, relinkableTo: true, // let user reconnect links
      toShortLength: 4, fromShortLength: 2
    },
    $(go.Shape, { strokeWidth: 1.5 }),
    $(go.Shape, { toArrow: "Standard", stroke: null })
  );
const nodeTemplate= 
  $(go.Node, "Auto",
    { copyable: false, deletable: false },
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
            editable:true
          },
          new go.Binding("text", "key").makeTwoWay())),
      // this Panel holds a Panel for each item object in the itemArray;
      // each item Panel is defined by the itemTemplate to be a TableRow in this Table
      $(go.Panel, "Table",
        {
          padding: 2,
          minSize: new go.Size(100, 10),
          defaultStretch: go.GraphObject.Horizontal,
          itemTemplate: fieldTemplate
        },
        new go.Binding("itemArray", "fields")
      )  // end Table Panel of items
    )  // end Vertical Panel
  );  // end Node

const showModel = ()=>{
  let fetchData="";
  let dataRef = firebase.database().ref('data');
  dataRef.on("value", function(snapshot) {
    console.log("Firebase Data Changed-\n",snapshot.val());
    fetchData=(JSON.stringify(snapshot.val(), undefined, 2));
  });
  document.getElementById("mySavedModel").textContent ="Database changed. Firebase Data fetched:-\n";
  if(fetchData){
    document.getElementById("mySavedModel").textContent +=fetchData;
    
  }
  else{
    console.log("No records available");
    document.getElementById("mySavedModel").textContent +="No records available";
  }
}
const getDefaultLinkDataArray =()=>{
  return  [
          { from: "Table1", fromPort: "field1", to: "Table2", toPort: "field1" },
          { from: "Table1", fromPort: "field2", to: "Table2", toPort: "field4" },
          { from: "Table1", fromPort: "field3", to: "Table2", toPort: "field2" }
        ];
}
const getDefaultNodeDataArray= ()=>{
   return [
    {
      key: "Table1",
      fields: [
        { name: "field1",text:"Field 1", info: "Number"},
        { name: "field2",text:"Field 2", info: "Object" },
        { name: "field3",text:"Field 3", info: "Null" }
      ],
      loc: "0 0"
    },
    {
      key: "Table2",
      fields: [
        { name: "field1",text:"Field 1" ,info: "Number"},
        { name: "field2",text:"Field 2" ,info: "Object"},
        { name: "field3",text:"Field 3" ,info: "Object"},
        { name: "field4",text:"Field 4" ,info: "Object"}
      ],
      loc: "180 0"
    }
  ];
}
const onLoadModel = 
 $(go.GraphLinksModel,
      {
        copiesArrays: true,
        copiesArrayObjects: true,
        linkFromPortIdProperty: "fromPort",
        linkToPortIdProperty: "toPort",
        nodeDataArray:getDefaultNodeDataArray(),
        linkDataArray:getDefaultLinkDataArray()
});
const addTable = () => {
    myDiagram.commit(d => {
        tableCount = myDiagram.model.nodeDataArray.length + 1;
        const node = {
            key: `Table ${tableCount}`,
            fields: [
                { name: 'field1', text: 'Field #1', info: '1st Field' },
                { name: 'field2', text: 'Field #2', info: '2nd Field' },
                { name: 'field3', text: 'Field #3', info: '3rd Field' },
                { name: 'field4', text: 'Field #4', info: '4th Field' }
            ],
            loc: '350 0'
        };
        d.model.addNodeData(node);
    }, 'Add Table');
}

const resetDiagram = () => {
    myDiagram.commit(d => {
        d.model.nodeDataArray = getDefaultNodeDataArray();
        d.model.linkDataArray = getDefaultLinkDataArray();
    }, 'Reset Diagram');
}