function toggle() {
  var fp = document.getElementsByClassName('fingerprint');
  var vfp = document.getElementById('viewfp');
  if (!vfp.innerHTML || vfp.innerHTML == 'hide') {
    vfp.innerHTML = 'show';
    for (var i=0; i < fp.length; i++) {
      fp[i].style.display='none';
    }
  } else {
    vfp.innerHTML = 'hide';
    for (var i=0; i < fp.length; i++) {
      fp[i].style.display='table-row';
    }
  }
}	

document.addEventListener("DOMContentLoaded", toggle);
