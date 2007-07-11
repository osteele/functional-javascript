<!--
  Author: Oliver Steele
  Copyright: Copyright 2006 Oliver Steele.  All rights reserved.
  Homepage: http://osteele.com/sources/javascript
  License: MIT License.
-->

<html xmlns="http://www.w3.org/1999/xhtml">
 <head>
   <script type="text/javascript" src="bezier.js"></script>
   <script type="text/javascript" src="path.js"></script>
   <script type="text/javascript" src="bezier-demo.js"></script>
 </head>
 <body>

   <a id="startLink" href="#" onclick="startAnimation(); return false">Start Animation</a>
   <a id="stopLink" href="#" onclick="stopAnimation(); return false" style="display: none">Stop Animation</a><br/>

   <div style="position: relative">
     <canvas id="bg" width="310" height="244" style="position: absolute">
     </canvas>
     <canvas id="fg" width="310" height="244" style="position: absolute">
     </canvas>
   </div>
   
   <script type="text/javascript">
     var canvas = document.getElementById('bg');
     var ctx = canvas.getContext('2d');
     drawBeziers(ctx);
     
     var canvas = document.getElementById('fg');
     var ctx = canvas.getContext('2d');
     
     // don't mistake me for a real animation system!
     var animation = {timer: null, value: 0, duration: 5 * 1000};
     
     function stepAnimation() {
       var t = (new Date().getTime() - animation.startTime) / animation.duration;
       animation.value = t %= 1.0;
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       drawBezierSamples(ctx, t);
     }
     
     function startAnimation() {
       var framerate = 30;
       animation.startTime = new Date().getTime() - animation.value * animation.duration;
       animation.timer = animation.timer || setInterval(stepAnimation, 1000/framerate);
       document.getElementById('startLink').style.display = 'none';
       document.getElementById('stopLink').style.display = '';
     }
     
     function stopAnimation() {
       if (animation.timer) {
         clearInterval(animation.timer);
	 animation.timer = null;
       }
       document.getElementById('startLink').style.display = '';
       document.getElementById('stopLink').style.display = 'none';
     }
   </script>
   
 </body>
</html>