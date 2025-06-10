
var myApp = {};

(function (){

    // Assign global firebase to this firebase
    var firebase = myFirebase;

    // Handle response message
    function messageHandler(err){
        if(!!err){
            console.log(err);
        } else {
            console.log("Success");
        }
    }

    // Create a path and add data
    // function fnCreate(path,data){

    //     // Create
    //     firebase.myDatabase.create(path,data,messageHandler);
    // }

    function fnCreate(path, body) {
        return new Promise(function (resolve, reject) {
        if (!path || !body) {
            reject("Invalid path or body");
        }
    
        firebase.myDatabase.create(path, body, function (err) {
            if (err) {
            reject(err);
            } else {
            resolve("Success");
            }
        });
        });
    }

    // Update a specific path
    function fnUpdate(path,data){
        
        // Update
        firebase.myDatabase.update(path,data,messageHandler);
    }

    // Read from a specific path
    function fnRead(path,callback){

        // Handle success
        function successHandler(snapshot){
            
            if(!!snapshot){
                // console.log(snapshot.val());
                callback(snapshot.val());
            } else {
                console.log("No data");
            }
        }

        // Read
        firebase.myDatabase.read(path,successHandler,messageHandler);
    }

    // Delete specific path
    function fnDelete(path){

        // Delete
        firebase.myDatabase.delete(path,messageHandler);
    }

    // Upload file
    function fnUpload(path,image,callback)
    {
        firebase.myStorage.put(path,image,callback);
    }

    // Get File
    function fnGet(path,callback)
    {
        firebase.myStorage.get(path,callback);
    }

     // Get database reference
     function fnRef(path) {
        return firebase.database().ref(path);
    }

    // Export
    myApp.create = fnCreate;
    myApp.read = fnRead;
    myApp.update = fnUpdate;
    myApp.delete = fnDelete; 
    myApp.upload = fnUpload;
    myApp.get = fnGet;
    myApp.ref = fnRef
})();