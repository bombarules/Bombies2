# Makes the offline copies (Android app and GitHub Pages) from web/bombies.html.
# Needs three.js r128 and the Bebas Neue font in build/vendor/:
#   npm pack three@0.128.0  and  npm pack @fontsource/bebas-neue  (unpack into build/vendor/three and build/vendor/bebas-neue)
import re,base64
s=open('web/bombies.html').read()
three=open('build/vendor/three/build/three.min.js').read()
font=base64.b64encode(open('build/vendor/bebas-neue/files/bebas-neue-latin-400-normal.woff2','rb').read()).decode()
o=re.sub(r'<link rel="preconnect"[^>]*>\n','',s)
o=re.sub(r'<link href="https://fonts.googleapis.com[^>]*>','<style>@font-face{font-family:"Bebas Neue";src:url(data:font/woff2;base64,'+font+') format("woff2");font-display:block}</style>',o)
o=o.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>','<script>'+three.replace('</script>','<\\/script>')+'</script>')
head=open('build/pwa_head.html').read()
open('web/github-pages/index.html','w').write(o.replace('<title>Bombies</title>','<title>Bombies</title>\n'+head,1))
open('android/app/assets/index.html','w').write(o.replace('#fsBtn{position:absolute;','#fsBtn{display:none!important;position:absolute;'))
print('offline copies written')
