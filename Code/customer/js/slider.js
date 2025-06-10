let currentSlideIndex = 0;
let slideInterval;


var sliderEvent={}

// Function to generate slides
function generateSlides(slidesData) {
  //save to db
  sliderEvent = slidesData;
  let data = JSON.stringify(slidesData)
  window.localStorage.setItem("slider", data );

  const sliderContainer = document.querySelector('.slider');
  const indicatorsContainer = document.querySelector('.indicators');

  slidesData.forEach((slide, index) => {
    const slideElement = document.createElement('div');
    slideElement.classList.add('slide');

    const overlayElement = document.createElement('div');
    overlayElement.classList.add('overlay');


    const imgElement = document.createElement('img');
    imgElement.src = slide.image;
    imgElement.alt = slide.title;

    
    const slideContent = document.createElement('div');
    slideContent.classList.add('slide-content');

    const titleElement = document.createElement('h2');
    titleElement.textContent = slide.title;

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = slide.description;

    const linkElement = document.createElement('a');
    linkElement.href = slide.link;
    linkElement.classList.add('learn-more');
    linkElement.classList.add('get-ticket-button');
    linkElement.textContent = 'Learn More';

    slideContent.appendChild(titleElement);
    slideContent.appendChild(descriptionElement);
    slideContent.appendChild(linkElement);


    slideElement.appendChild(imgElement);
    slideElement.appendChild(slideContent);
    slideElement.appendChild(overlayElement);
        
    sliderContainer.appendChild(slideElement);

    // Create indicator for each slide
    const indicatorElement = document.createElement('div');
    indicatorElement.classList.add('indicator');
    indicatorsContainer.appendChild(indicatorElement);

    indicatorElement.addEventListener('click', () => {
      changeSlide(index);
    });
  });

  // Add 'active' class to the first slide and indicator
  const firstSlide = document.querySelector('.slide');
  const firstIndicator = document.querySelector('.indicator');
  firstSlide.classList.add('active');
  firstIndicator.classList.add('active');
}

// Function to change slide
function changeSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const indicators = document.querySelectorAll('.indicator');
  
  slides[currentSlideIndex].classList.remove('active');
  indicators[currentSlideIndex].classList.remove('active');
  
  slides[index].classList.add('active');
  indicators[index].classList.add('active');
  
  currentSlideIndex = index;
}

// Function to start slide interval
function startSlideInterval(slidesData) {
  slideInterval = setInterval(() => {
    let nextSlideIndex = (currentSlideIndex + 1) % slidesData.length;
    changeSlide(nextSlideIndex);
  }, 3000);
}



function getSlides(list){
  // console.log(list)
  var slidesData = [];

  // Iterate over each event object
  for (var key in list) {
    if (list.hasOwnProperty(key)) {
      var event = list[key];

      // Create a new slide object with the required properties
      var slide = {
        image: event.image,
        title: event.title,
        description: event.description,
        link: "eventDescription.html?eventId="+event.eventId
      };

      // Add the slide object to the slidesData array
      slidesData.push(slide);
    }
  }

  // console.log(slidesData);
  if(slidesData.length > 0)
  {
  // Call the function to generate slides
  generateSlides(slidesData);

  // Start the slide interval
  startSlideInterval(slidesData);
  }

}

myApp.read("sliderNew", getSlides);
