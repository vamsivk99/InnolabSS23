import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js';


let eventIDList= [];

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
      apiKey: "AIzaSyDlsb10aXwyqGAgq0A8ZL3P3ffpaYiOCus",
      authDomain: "artefacto-84a15.firebaseapp.com",
      projectId: "artefacto-84a15",
      storageBucket: "artefacto-84a15.appspot.com",
      messagingSenderId: "592239065371",
      appId: "1:592239065371:web:ad6f110ddf714944383bbe",
      measurementId: "G-XX1CGQLBHV"
      };


// function fetchSingleEventDataFromFirebase(eventId) {
//   console.log(`Fetching data for event with ID: ${eventId} from Firebase database...`);
  
//   const database = getDatabase();
//   const eventRef = ref(database, `events/${eventId}`);
  
//   onValue(eventRef, (snapshot) => {
//     const eventData = snapshot.val();
//     if (eventData) {
//       console.log("Event data:", eventData);
//       // Call a function or use the data as needed for the specific event.
//     } else {
//       console.log(`No data found for event with ID: ${eventId}.`);
//     }
//   }, (error) => {
//     console.error(`Error fetching data for event with ID: ${eventId}`, error);
//   });
// }


function fetch3DEventsFromFirebase() {
  console.log("Fetching 3D events from Firebase database...");

  const database = getDatabase();
  const events3DRef = ref(database, '3d');

  onValue(events3DRef, (snapshot) => {
    const eventsData = snapshot.val();
    if (eventsData && Array.isArray(eventsData)) {
      console.log("3D Events:", eventsData);
      eventIDList = eventsData;
          getDataEvent(2);

    } else {
      console.log("No 3D events data found.");
    }
  }, (error) => {
    console.error("Error fetching 3D events data:", error);
  });
  
  }


function consoleName() {
    console.log("firebase: console name called");
    // fetchEventsFromFirebase();
    // fetchSingleEventDataFromFirebase("1689415110013");
    // const position = 0;
    // fetchEventAtPositionFromFirebase(position);

    
    fetch3DEventsFromFirebase();
    console.log(eventIDList);
}

function fetchEventDataFromFirebase(eventId) {
  console.log(`Fetching data for event with ID: ${eventId} from Firebase database...`);
  
  const database = getDatabase();
  const eventRef = ref(database, `events/${eventId}`);
  
  return new Promise((resolve, reject) => {
    onValue(eventRef, (snapshot) => {
      const eventData = snapshot.val();
      if (eventData) {
      //  console.log("Event data:", eventData);
        resolve(eventData);
      } else {
        console.log(`No data found for event with ID: ${eventId}.`);
        reject(new Error(`No data found for event with ID: ${eventId}.`));
      }
    }, (error) => {
      console.error(`Error fetching data for event with ID: ${eventId}`, error);
      reject(error);
    });
  });
}


// function getDataEvent(pos){
//   const eventId = eventIDList[pos];
//   fetchEventDataFromFirebase(eventId)
//   .then((eventData) => {
//     // Handle the fetched data here
//    // console.log("Fetched event data:", eventData);
//     Animate.Instance.object=eventData;

//     return;

//   })
//   .catch((error) => {
//     // Handle any errors that occurred during the fetch
//     console.error("Error fetching event data:", error);
//   });
  
// }

function getDataEvent(pos) {
  const eventId = eventIDList[pos];

  // Return a Promise that resolves with the fetched eventData
  return new Promise((resolve, reject) => {
    fetchEventDataFromFirebase(eventId)
      .then((eventData) => {
        // Handle the fetched data here
        // console.log("Fetched event data:", eventData);
        resolve(eventData); // Resolve the Promise with the eventData
      })
      .catch((error) => {
        // Handle any errors that occurred during the fetch
        console.error("Error fetching event data:", error);
        reject(error); // Reject the Promise with the error
      });
  });
}




// function populateEventList(eventsData) {
//   console.log(eventsData);
// }

window.consoleName = consoleName;
window.firebaseApp = initializeApp(firebaseConfig);
window.getDataEvent=getDataEvent;
window.eventIDList=eventIDList;




// function fetchEventsFromFirebase() {
//   console.log("Fetching events from Firebase database...");
  
//   const database = getDatabase();
//   const eventsRef = ref(database, 'events');
  
//   onValue(eventsRef, (snapshot) => {
//     const eventsData = snapshot.val();
//     if (eventsData) {
//       populateEventList(eventsData);
//     } else {
//       console.log("No events data found.");
//     }
//   }, (error) => {
//     console.error("Error fetching events data:", error);
//   });
// }