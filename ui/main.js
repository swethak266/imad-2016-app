console.log('Loaded!');
 
 var text=document.getElementById('t');
 text.innerHTML ="new value";
 
 var img = document.getElementById('madi');
 img.onclick = function() {
     img.style.marginLeft = '100px';
 };
 
 setInterval(function(){ 
     var img = document.getElementById('madi');
     img.style.marginLeft = '10px';
 }, 1000);