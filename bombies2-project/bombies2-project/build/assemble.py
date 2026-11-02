# Joins the six source files into the single-page game.
# Run from the bombies-project folder:  python3 build/assemble.py
src=open('src/template.html').read()
js=''.join(open('src/'+f).read() for f in ['core1.js','core2.js','world.js','ar_model.js','qbz_model.js','core3_rest.js','tacgear.js','core4.js','horde.js','intro_video.js','hale.js','core5.js'])
i=src.index('<script>\n',src.index('three.min.js'));j=src.index('</script>',i)
out=src[:i]+'<script>\n'+js+src[j:]
import re
out=re.sub(r'/\*DBG\*/.*?/\*ENDDBG\*/','',out,flags=re.S)
open('web/bombies.html','w').write(out)
print('web/bombies.html written')
