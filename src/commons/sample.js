
(async function() {
    var sleep = function(para) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                console.log('para: ', para)
                resolve(para * para)
            }, 1000)
        })
    }

    var result = await sleep(2);
    console.log('result: ', result);
}());

/*var nodes = [{id: 1, data: 25, left:2, right:3}, 
            {id: 2, data: 15, left:4, right:5},
            {id: 3, data: 50, left:6, right:7},
            
            {id: 4, data: 10, left:8, right:9},
            {id: 5, data: 22, left:10, right:11},

            {id: 6, data: 35, left:12, right:13},
            {id: 7, data: 70, left:14, right:15},

            {id: 8, data: 4},
            {id: 9, data: 12},
            {id: 10, data: 18},
            {id: 11, data: 24},
            {id: 12, data: 31},
            {id: 13, data: 44},
            {id: 14, data: 66},
            {id: 15, data: 90} ]*/

var nodes = [{id: 1, data: "admin", left:2, right:3, parentId : -1}, 
                {id: 2, data: "zak100", left:4, parentId : 1},
                {id: 3, data: "vizhi", left:5, right:6, parentId : 1},
                
                {id: 4, data: "pensen", right:7, parentId : 2},
                {id: 5, data: "suresh", parentId : 3},
                {id: 6, data: "menaga", parentId : 3},


                {id: 7, data: "raja", right:8, parentId : 4},
    
                {id: 8, data: "malar", right:9, parentId : 7},
                {id: 9, data: "john", parentId : 8}]

var counter = 0;

function getDocument (id) {
    var document;
    nodes.forEach(doc => { 
        if (id == doc.id) {
            //console.info('document = ', doc);
            document = doc;
        }
    });

    return document;
}
async function printPreorder (id, docs, callback) {
    const doc = await getDocument(id);
    
    if (doc == null) 
        return; 
    console.info('doc => ', doc);
    //console.info('doc = ', doc);
    docs.push(doc);
    /* then recur on left sutree */
    console.info('doc id = ', doc.id , ' left = ', doc.left , ' right = ', doc.right, ' parent = ', doc.parent);
    //if (doc.left != undefined) {
       printPreorder(doc.left, docs);  
    //}
  
    /* now recur on right subtree */
    //if (doc.right != undefined) {
        printPreorder(doc.right, docs); 
    //}

    //console.info('callback = ', docs);
    //callback(docs);
}  

console.info('------------------------');
 var docs = [];
 printPreorder(1, docs, function (docs) {
     console.info('docs = ', docs);
 });
const MAX_RETRIES = 5

const listObjects1 = async (
    id,
    resultList, // This is the list of combined results from all calls.
    attemptCount
) => {
console.log('Inside')
// This function will return a Promise
attemptCount = attemptCount ? attemptCount : 0
//console.info('id ==> ', id);
const doc = await getDocument(id);
//console.info('doc =======> ', doc);
console.info('---------------------');  
return new Promise( (resolve, reject) => {

        if (!doc) {
         return;   
        }
        attemptCount++  
        //const doc = await getDocument(id);
        //resultList.push(attemptCount);
        //console.log(`attempt ${attemptCount}`)
        //console.info('doc = ', doc);
        resultList.push(doc);
        // initialize an empty result list on the first call
        let list = resultList ? resultList : [] 
        
        

        // combine the master list with the result of this function call.
        //list = list.push(1); 
        if (doc.left != null) {
            //return foooo(doc.left, list, callback);
            listObjects1(doc.left, list, attemptCount).then( (list) => {
                resolve(list)
            })
        }

        if (doc.right != null) {
            listObjects1(doc.right, list, attemptCount).then( (list) => {
                resolve(list)
            })
        }
        console.info('doc = ', doc, ' id = ', doc.id , ' parent id = ', doc.parentId);
        
        //if (doc.id == id) {
            //resolve(list)
       // }
    });
}

//console.info("listObjects1 = ", listObjects1);

var docs = [];

function resolveAfter2Seconds(x) { 
    attemptCount = attemptCount ? attemptCount : 0
    return new Promise(resolve => {
        /*setTimeout(() => {
            resolve(x);
        }, 2000);*/
        if(attemptCount > MAX_RETRIES) {
            reject('max retries exceeded')
            //return resultList;
        } else {  
            
        }
    });
}

async function f1() {
    // Promise.all(listObjects1(1, docs)).then(function(values) { 
    //     console.log('values ======> ', values); 
    // });  
    var x = await listObjects1(1, docs);
    console.log('x = ', x); // 10
}

//f1();

async function doPreOrder(id, str, users) {
    const root = await getDocument(id);
    if(!root) {
      return str;
    } else {
      str += root.data + ' ';
      str = await doPreOrder(root.left, str, users);
      str = await doPreOrder(root.right, str, users);
    }
    console.info('str = ', str);
    //return str;
  }
  
  async function preOrder(id) {
    var users = [];
    var x = await doPreOrder(1, "", users);
    console.log('x = ', x);
  }
  //preOrder();
// listObjects(docs).then(function(value) {
//     console.log('value: ' + value);
//   });
// listObjects.then(function(result) {
//     console.info('list = ', result);
// });
//console.info('d = ', d);
console.info('------------------------');

// var current = Promise.resolve();
// var ids = [1, 2, 3];
// Promise.all(ids.map(function(id) { 
//     current = current.then(function() {
//         return getItem(id) // returns promise
//     }).then(function(result) { 
//         return "hello";
//     });
//     return current;
// })).then(function(results) {
//     console.info('results = ', results);
//     // results is an array of names
// })

function getItem(id) {
    return id;
}

//var d3 = require("d3-hierarchy");
/*
var table = [
  {"_id": "Eve",   "parentId": ""},
  {"_id": "Cain",  "parentId": "Eve"},
  {"_id": "Seth",  "parentId": "Eve"},
  {"_id": "Enos",  "parentId": "Seth"},
  {"_id": "Noam",  "parentId": "Seth"},
  {"_id": "Abel",  "parentId": "Eve"},
  {"_id": "Awan",  "parentId": "Eve"},
  {"_id": "Enoch", "parentId": "Awan"},
  {"_id": "Azura", "parentId": "Eve"}
];

var root = d3.stratify()
    .id(function(d) { return d._id; })
    .parentId(function(d) { return d.parentId; })
    (table);
console.info('root = ', root);*/
