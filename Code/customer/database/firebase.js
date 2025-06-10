
// Global firebase
var myFirebase = {};


(function(){
    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
      apiKey: "AIzaSyDlsb10aXwyqGAgq0A8ZL3P3ffpaYiOCus",
      authDomain: "artefacto-84a15.firebaseapp.com",
      projectId: "artefacto-84a15",
      storageBucket: "artefacto-84a15.appspot.com",
      messagingSenderId: "592239065371",
      appId: "1:592239065371:web:ad6f110ddf714944383bbe",
      measurementId: "G-XX1CGQLBHV"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Assingn to global firebase
    myFirebase = firebase;


    // Create record
    function create(path, body, callback){

      if(!path || !body){
        return;
      }
      myFirebase.database().ref(path).set(body,callback);
    }

    // Update record
    function update(path, body, callback){
      if(!path || !body){
        return;
      }
      myFirebase.database().ref(path).update(body,callback);
    }

    // Read record
    function read(path,successFun,errorFun){
      if (!path || !successFun || !errorFun) {
        return;
      }
      myFirebase.database().ref(path).once("value").then(successFun,errorFun);
    }

    // Delete record
    function del(path,callback){
      if(!path){
        return;
      }
      myFirebase.database().ref(path).remove(callback);
    }

    // Put in storage
    function put(path,image,callback){
      if(!path || !image){
        return;
      }
      path = path+"";
      myFirebase.storage().ref(path).put(image).then(function() {

        // console.log("Uploaded");
        
        // Get URL
        myFirebase.storage().ref(path).getDownloadURL().then(function(url) {
          
          // Set url
          callback(path,url);
          
      });

    });

    }

    // Get storage
    function get(path,callback){
      
      if(!path || !callback){
        return;
      }
      
      path = path+"";

      // Get URL
      myFirebase.storage().ref(path).getDownloadURL().then(function(url) {
        
        // Set url
        callback(path,url);
    });
    }

    
    // Database 
    myFirebase.myDatabase = {
      create : create,
      update : update,
      delete : del,
      read : read
    };

    // Storage
    myFirebase.myStorage = {
      put : put,
      get : get
    }
    
})();