console.log('Loaded!');
 
 var text=document.getElementById('t');
 text.innerHTML ="new value";
 
 var img = document.getElementById('madi');
 img.onclick = function() {
     img.style.marginLeft = '100px';
 };
 
 setInterval(function(){ 
     var img = document.getElementById('madi');
     var cnt = document.getElementById('madi').getAttribute("cnt");
     cnt = Number(cnt)+10;
     img.style.marginLeft = cnt+'px';
    document.getElementById('madi').setAttribute("cnt", cnt);
 }, 100);