//const body = document.getElementById('main_body');

function setChangeSlideInterval () {
  if (window.slideInterval) clearInterval(window.slideInterval);

  window.slideInterval = setInterval(() => {
    if (location.hash != '#explore') clearInterval(slideInterval);

    console.log('switch!');
    nextSlide();
  }, 5000);
}

async function showSlide (page) {
  const slideshow_div = document.getElementById('slideshow'),
        page_index = (page % slideshow_div.querySelectorAll('.slide').length) || 0;

  console.log(slideshow_div.querySelectorAll('.slide'), page_index);

  slideshow_div.querySelectorAll('.slide.active')[0]?.classList.remove('active');
  slideshow_div.querySelectorAll('.slide')[page_index].classList.add('active');
}

function nextSlide () {
  const slideshow_div = document.getElementById('slideshow');

  console.log(slideshow_div.querySelectorAll('.slide.active'))

  let currentSlideIndex = Array.from( slideshow_div.querySelectorAll('.slide') ).indexOf( slideshow_div.querySelectorAll('.slide.active')[0] );

  console.log(currentSlideIndex)
  showSlide(currentSlideIndex + 1)
}

function prevSlide () {
  const slideshow_div = document.getElementById('slideshow');

  console.log(slideshow_div.querySelectorAll('.slide.active'))

  let numberOfSlides = slideshow_div.querySelectorAll('.slide').length
  let currentSlideIndex = Array.from( slideshow_div.querySelectorAll('.slide') ).indexOf( slideshow_div.querySelectorAll('.slide.active')[0] );

  console.log(currentSlideIndex)

  if (currentSlideIndex == 0) {
    showSlide(numberOfSlides - 1)
  } else {
    showSlide(currentSlideIndex - 1)
  }
}

async function explore () {
  const pkgDetails = await fetch('./package_meta.json').then(res => res.json()),
        slideshow = document.createElement('div'),
        availableApps = document.createElement('div');

  slideshow.id = 'slideshow'

  slideshow.style = 'position: relative; height: 4in; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;'
  availableApps.style = 'width: 100%; display: flex; flex-wrap: wrap; justify-content: center;'

  slideshow.innerHTML += `
    <button id="slide_prevBtn" style="position: absolute; left: 5%; z-index: 999;" onclick="prevSlide();">❮</button>
    <button id="slide_nextBtn" style="position: absolute; right: 5%; z-index: 999;" onclick="nextSlide();">❯</button>
  `
  for (const pkg of pkgDetails) {
    availableApps.innerHTML += `
      <div onclick="location.href = 'package_details.html'" style="cursor: pointer; margin: 10px 10px 10px 10px; padding-left: 15px; background-color: rgba(255, 255, 255, 0.07); border-radius: 10px; height: 70px; width: 280px; flex-basis: auto; flex-shrink: 0; display: flex; align-items: center; position: relative;">
        <img style="height: 45px; width: 45px; object-fit: contain;" src=${pkg.icons.small}>
        <div style="width: calc(100% - 50px); display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <p style="max-width: 100%; white-space: nowrap; font-weight: bold; font-size: 15px; text-overflow: ellipsis; overflow: hidden;">${pkg.name}</p>
          <p style="max-width: 100%; white-space: nowrap; color: rgb(153, 153, 153); font-size: 10px; text-overflow: ellipsis; overflow: hidden;">${pkg.description}</p>
        </div>
      </div>
    `

    let slide_img = new Image();

    slide_img.src = pkg.icons.big;

    let img_tone = await new Promise((resolve, reject) => { slide_img.onload = () => resolve( getAverageRGB(slide_img) ); })
    let img_bg_brightness = Math.floor((img_tone.r + img_tone.g + img_tone.b) / 127.5)

    console.log(img_tone)

    slideshow.innerHTML += `
      <div class='slide' style="position: absolute; border-radius: 20px; background-color: rgb(${img_tone.r}, ${img_tone.g}, ${img_tone.b})">
        <img style="height: 1in; width: 1in; object-fit: contain;" src=${pkg.icons.big}>
        <h2 style="color: ${img_bg_brightness > 127.5 ? 'black' : 'white'}">${pkg.name}</h2>
        <p style="color: ${img_bg_brightness > 127.5 ? 'black' : 'white'}">${pkg.description}</p>
      </div>
    `
  };

  body.appendChild(slideshow);
  body.appendChild(availableApps);

  document.getElementById('slide_prevBtn').onclick = () => {
    prevSlide();
  
    clearInterval(slideInterval);
    setChangeSlideInterval();
  }

  document.getElementById('slide_nextBtn').onclick = () => {
    nextSlide();
  
    clearInterval(slideInterval);
    setChangeSlideInterval();
  }

  showSlide( 0 /*Math.floor(Math.random() * pkgDetails.length)*/ );
  setChangeSlideInterval();
}

//switch_page('explore');