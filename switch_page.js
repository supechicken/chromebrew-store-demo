function switch_page (pageID) {
  const body_div = document.getElementById('main_body'),
        navbar = document.getElementById('nav');

  window/

  navbar.querySelectorAll('.active').forEach(e => e.classList.remove('active'));
  document.getElementById(pageID).classList.add('active');

  body_div.innerHTML = '';
  eval(`${pageID}();`);
}