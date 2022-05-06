//const body = document.getElementById('main_body');

function installed () {
  const div = document.createElement('div');
  div.style = "height: 100%; width: 100%; background-color: rgba(255, 255, 255, 0.1);"

  div.innerHTML += `
    <div style="width: 100%; position:relative; display: flex; align-items: center;">
      <div class='eeeee' onclick="location.href = 'package_details.html'" style="cursor: pointer; display: flex; align-items: center; width: 100%;">
        <img src='https://github.com/skycocker/chromebrew/raw/master/images/brew.png' style='height: 70px; width: 70px; object-fit: contain;'>
        <p style="margin-left: 10px; width: 25%; font-weight: bold;">Chromebrew App</p>
        <p style="width: calc(75% - 180px);">A graphical interface for Chromebrew</p>
      </div>
      <button onclick="alert('Test');" style="position: absolute; right: 10px">Remove</button>
    </div>
  `

  body.innerHTML = '';
  body.appendChild(div);
}