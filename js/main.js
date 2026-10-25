const IMG=window.WEDDING_IMAGES;
const PRE=window.WEDDING_PRESETS;
const FH=window.WEDDING_FONTS.heading;
const FB=window.WEDDING_FONTS.body;
const RSVP_ENDPOINT='/.netlify/functions/rsvp';
const LEGACY_DEF={groom:'Lalith',bride:'Anjana',bless:'With the blessings of our families, friends and elders',inv1:'We cordially invite you to celebrate our wedding and reception with the blessings of our families and elders.',inv2:'',inv3:'Your presence would make our celebration truly special.',blessSub:'Your presence and good wishes will make our celebration complete.',wEnd:'09:20',rDate:'2026-12-06T18:00',rEnd:'22:30',rVenue:'Annalakshmi Restaurant',rAddr:'6 Mayor Ramanathan Salai, Chennai, India',rMap:'https://maps.app.goo.gl/vN3tiGAB5BfHAyBB8',tag:'Together with their families',shloka:'॥ श्री गणेशाय नमः ॥',date:'2026-11-29T08:00',venue:'Central Auditorium',addr:'North Paravur, Kerala, India',map:'https://maps.app.goo.gl/XAEM92g9pdnygrfF6',rsvpBy:'Leave your wishes for the couple',
groomStory:'A gentle soul with a laugh that fills every room. Always the first to say yes to an adventure.',brideStory:'Graceful, warm and full of wonder. She turns every ordinary day into a celebration.',
story:`It all began in Bangalore, where traffic moves slowly, but somehow love found the express lane.

She is from Keralam, and he is from Chennai. They speak different mother tongues but share one language perfectly: laughter.

A trip to Wayanad with friends brought them closer through long drives, off-key singing, and jokes only they understood. She is quiet and observant, happiest in life’s little moments. He can turn any ordinary moment into fun, sometimes intentionally.

She has a checklist for love: respect, reassurance, and someone who makes life lighter. He has no checklist — he simply knows she is the one. After learning almost every South Indian language except Malayalam, he finds himself falling for a Malayali girl. Clearly, fate has a sense of humour and it has a particularly amusing plan for him.

Between his keyboard, her ukulele, countless conversations, and endless laughter, they find something that feels like home. He becomes her constant, always checking in, making time to talk, and reminding her that he is there.

Their journey brought challenges, but patience, understanding, and love gave them even more reasons to choose each other. No matter the disagreement, they always find their way back to peace, the one thing they both prefer over everything else. Along the way, they discovered that what they share is worth holding on to.

Now, with their families’ blessings, they are ready to begin a new chapter filled with songs, adventures, memories, and a lifetime of choosing each other.`,
groomFam:'The Groom’s Family',groomParents:'Mr. & Mrs. Groom’s Parents\nSon of the family\nEdit these names in Customize',brideFam:'The Bride’s Family',brideParents:'Mr. & Mrs. Bride’s Parents\nDaughter of the family\nEdit these names in Customize',
email:'',wa:'',maroon:PRE[0][1],cream:PRE[0][2],gold:PRE[0][3],fh:PRE[0][4],fb:PRE[0][5],hero:'p6',cover:'p2',b1:'p15',b2:'p16',b3:'p17',sp:['p13','p14'],spCap:'Where our story began',gImg:'p12',bImg:'p10',gal:['p7','p5','p2','p8','p4','p1','p3','p9','p6'],
ev:[{n:'Mehendi',w:'19 Feb · 4:00 PM',d:'Henna, music and laughter with family and friends.'},{n:'Haldi',w:'20 Feb · 10:00 AM',d:'A joyful, golden morning of blessings.'},{n:'Vivaham (Muhurtham)',w:'21 Feb · 10:30 AM',d:'The sacred wedding ceremony before the holy fire.'},{n:'Reception & Sadhya',w:'21 Feb · 12:30 PM',d:'Join us for a traditional feast and celebration.'}]};
const DEF=Object.assign({},window.WEDDING_CONTENT||LEGACY_DEF);
let D=Object.assign({},DEF),revealed=0,first=1;if((D.date||'').startsWith('2027-02-21'))D.date=DEF.date;if((D.shloka||'').includes('गणेश'))D.shloka='';if(D.gImg=='p3'||D.gImg=='p11')D.gImg=DEF.gImg;if((D.inv1||'').startsWith('We cordially invite you to join us'))D.inv1=DEF.inv1;if((D.inv2||'').startsWith('With the love that brought'))D.inv2=DEF.inv2;if(D.bImg=='p9')D.bImg=DEF.bImg;if((D.inv1||'').startsWith('cordially'))D.inv1=DEF.inv1;if((D.rsvpBy||'').includes('1 February'))D.rsvpBy=DEF.rsvpBy;['date','rDate'].forEach(k=>{if(!(/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(D[k]||'')&&!isNaN(new Date(D[k]))))D[k]=DEF[k]});['wEnd','rEnd'].forEach(k=>{if(!/^\d\d:\d\d$/.test(D[k]||''))D[k]=DEF[k]});
const $=s=>document.querySelector(s),save=()=>{try{const o={};for(const k in D)if(JSON.stringify(D[k])!=JSON.stringify(DEF[k]))o[k]=D[k];localStorage.setItem('inv',JSON.stringify(o))}catch(e){}},src=v=>IMG[v]||v,
esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),nl=s=>esc(s).replace(/\n/g,'<br>'),
man=(n=16)=>`<svg viewBox="-50 -50 100 100" class="man">${Array.from({length:n},(_,i)=>`<ellipse rx="4" ry="22" cy="-26" transform="rotate(${i*360/n})"/>`).join('')}<circle r="2" style="fill:var(--gold)"/>${[[0,-40],[40,0],[0,40],[-40,0]].map(p=>`<circle r="1.8" cx="${p[0]}" cy="${p[1]}" style="fill:var(--gold)"/>`).join('')}</svg>`,
dt=()=>new Date(D.date),fd=s=>new Date(s).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}),fu=s=>new Date(s).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}),fw=s=>new Date(s).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}),tm=t=>{const[h,m]=t.split(':');return new Date(2000,0,1,+h,+m).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'})},
EVS=()=>[{n:'Wedding',sub:'Muhurtham',s:D.date,e:D.date.slice(0,10)+'T'+D.wEnd,v:D.venue,a:D.addr,m:D.map,i:'w1'},{n:'Reception',sub:'Evening Celebration',s:D.rDate,e:D.rDate.slice(0,10)+'T'+D.rEnd,v:D.rVenue,a:D.rAddr,m:D.rMap,i:'r1'}],
cur=()=>new Date()<new Date(EVS()[0].e)?0:1,mapU=v=>v.m||'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(v.v+' '+v.a);
function render(){const r=document.documentElement.style;r.setProperty('--maroon',D.maroon);r.setProperty('--cream',D.cream);r.setProperty('--gold',D.gold);const cssSrc=v=>src(v).replace(/^assets\//,'../assets/');['b1','b2','b3'].forEach(k=>r.setProperty('--'+k,`url(${cssSrc(D[k])})`));r.setProperty('--wT',`url(${cssSrc('p18w')})`);r.setProperty('--fh',`'${D.fh}',Georgia,serif`);r.setProperty('--fb',`'${D.fb}',Georgia,serif`);
const d=dt(),ok=!isNaN(d),ds=ok?d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'Date to be announced',ts=ok?d.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'}):'';
document.title=`${D.groom} & ${D.bride} · Wedding Invitation`;
$('#app').innerHTML=`
<section id="hero"><div class="bgT" style="background-image:url(${src('p18')})"></div><div class="bgB" style="background-image:url(${src('p19')})"></div><div class="bgB bgBL" style="background-image:url(${src('p19')})"></div>${Array.from({length:18},(_,i)=>`<i class="fl" style="left:${(i*37+11)%96+2}%;--d:${7+(i*7)%9}s;--dl:-${(i*5)%13}s;--s:${3+(i*3)%5}px"></i>`).join('')}<div class="cv"><div class="arch"><div class="ringw">${man(16).replace('class="man"','class="man ring"')}</div><div class="frame"><img src="${src(D.cover)}" alt="Lalith and Anjana" width="1125" height="1500" fetchpriority="high" decoding="async"></div></div><h1 class="names"><span class="n1">${esc(D.groom)}</span><i>&amp;</i><span class="n2">${esc(D.bride)}</span></h1><p class="ob"><button class="btn" id="op">Open invitation</button></p></div></section>
<main id="main"><section class="sec rv" id="couple"><div class="eyebrow">The couple</div><h2>Bride &amp; Groom</h2><div class="div">${man(8)}</div><div class="cards"><div class="card"><img src="${src(D.gImg)}" alt="${esc(D.groom)} portrait" width="700" height="764" loading="lazy" decoding="async"><h3>${esc(D.groom)}</h3><p>${nl(D.groomStory)}</p></div><div class="card"><img src="${src(D.bImg)}" alt="${esc(D.bride)} portrait" width="933" height="1400" loading="lazy" decoding="async" style="object-position:center 20%"><h3>${esc(D.bride)}</h3><p>${nl(D.brideStory)}</p></div></div><div class="eyebrow" style="margin-top:34px">Our Story</div><div class="sp">${(D.sp||[]).map((g,index)=>`<img src="${src(g)}" alt="Our story" width="${index===0?'900':'811'}" height="${index===0?'1541':'1800'}" loading="lazy" decoding="async">`).join('')}</div>${D.spCap?`<p class="cap">${esc(D.spCap)}</p>`:''}<details class="lsd"><summary>Read our love story</summary><p class="lstory">${nl(D.story)}</p></details></section>
<section class="alt" id="s1"><div class="sec rv" id="fam"><h2 class="pn2" style="font-size:clamp(44px,10vw,84px)">${esc(D.groom)} &amp; ${esc(D.bride)}</h2><div class="div">${man(8)}</div><p class="story" style="margin-top:0">${nl(D.inv1)}</p><p style="margin:16px auto 0;font-size:15px">${[D.inv2,D.inv3].filter(Boolean).map(nl).join('<br>')}</p></div></section>
<section class="mar" id="s2"><div class="sec rv" id="date"><div class="eyebrow">Join us for</div><h2>Our Events</h2><div class="div">${man(8)}</div>
<div class="cards ecs">${EVS().map(v=>`<div class="ec"><div class="vh"><img class="vi" src="${src(v.i)}" alt="${esc(v.v)}" width="900" height="720" decoding="async"></div><div class="eh"><h3>${v.n}</h3><div class="eyebrow">${v.sub}</div><div class="orn"><i></i></div></div><ul class="det"><li><small>Date</small><b>${fw(v.s)}</b></li><li><small>Time</small><b>${tm(v.s.slice(11,16))} – ${tm(v.e.slice(11,16))}</b></li><li class="vn"><small>Venue</small><b>${esc(v.v)}</b><span>${nl(v.a)}</span></li></ul><a class="btn o" target="_blank" rel="noopener" href="${esc(mapU(v))}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>Google Maps</a></div>`).join('')}</div><p id="cdl" class="eyebrow" style="margin-top:46px"></p><div class="cd" id="cd"></div></div></section>


<section class="sec rv" id="gallery"><div class="eyebrow">Moments</div><h2>Our Gallery</h2><div class="div">${man(8)}</div><div class="gal">${D.gal.map((g,index)=>{const dimensions={p1:[1125,1500],p2:[1125,1500],p3:[960,1280],p4:[1163,1500],p5:[1500,1000],p6:[1500,1000],p7:[1500,1000],p8:[1500,1000],p9:[1500,1000]}[g]||[1200,1200];const orientation=dimensions[0]>dimensions[1]?'landscape':'portrait';return `<figure class="gal-item gal-item--${orientation}"><img src="${src(g)}" alt="Wedding photo ${index+1}" width="${dimensions[0]}" height="${dimensions[1]}" loading="lazy" decoding="async"></figure>`}).join('')}</div></section>
<section class="mar" id="s5"><div class="sec rv" id="rsvp"><div class="eyebrow">${esc(D.rsvpBy)}</div><h2>Will you join us?</h2><div class="div">${man(8)}</div><form class="rs" id="rf"><div class="ch"><label><input type="radio" name="a" value="Yes, we will come" checked><span>Yes, we will come</span></label><label><input type="radio" name="a" value="Can’t make it, but all blessings"><span>Can’t make it, but all blessings</span></label></div><input name="n" placeholder="Your name" required><input name="em" type="email" placeholder="Your email address" required><textarea name="m" rows="4" placeholder="Write your wishes for the couple"></textarea><button class="btn">Send</button><p id="ok" style="text-align:center;color:var(--gold);margin:0"></p></form></div></section>
<footer>${man(8)}<div class="shl" style="margin-top:8px">${esc(D.groom)} &amp; ${esc(D.bride)}</div><p>With love &amp; gratitude</p></footer></main>`;
const couple=$('#couple'),eyebrows=couple.querySelectorAll(':scope > .eyebrow'),storyLabel=eyebrows[1],coupleLabel=eyebrows[0],storyPhotos=couple.querySelector('.sp'),storyCaption=couple.querySelector('.cap'),loveStory=couple.querySelector('.lsd');
const main=$('#main');
main.insertBefore($('#s1'),couple);
main.insertBefore($('#gallery'),$('#s2'));
storyLabel.style.marginTop='0';
loveStory.open=true;
couple.insertBefore(storyLabel,couple.firstChild);
couple.insertBefore(loveStory,coupleLabel);
couple.insertBefore(storyPhotos,coupleLabel);
if(storyCaption)couple.insertBefore(storyCaption,coupleLabel);
document.querySelectorAll('.rv').forEach(e=>{if(first)io.observe(e);else e.classList.add('in')});first=0;
document.querySelectorAll('.gal img').forEach(i=>i.onclick=()=>{$('#lb img').src=i.src;$('#lb').style.display='grid'});
setupRsvp($('#rf'));
$('#op').onclick=()=>pg(1);pg(PG);scratch();tick()}
function setupRsvp(form){
const choices=form.querySelectorAll('input[name="a"]'),email=form.querySelector('[name="em"]'),name=form.querySelector('[name="n"]'),wishes=form.querySelector('[name="m"]'),submit=form.querySelector('.btn'),status=$('#ok');submit.type='submit';
choices[0].value='attending';choices[1].value='declined';
const wishesChoice=document.createElement('label'),wishesRadio=document.createElement('input'),wishesText=document.createElement('span');
wishesRadio.type='radio';wishesRadio.name='a';wishesRadio.value='wishes_only';wishesText.textContent='Send us your wishes';wishesChoice.append(wishesRadio,wishesText);choices[1].closest('label').after(wishesChoice);
email.required=false;email.maxLength=254;email.autocomplete='email';email.setAttribute('aria-label','Your email address (optional)');
name.required=true;name.maxLength=120;name.autocomplete='name';name.setAttribute('aria-label','Your name');
wishes.maxLength=1000;
status.setAttribute('role','status');status.setAttribute('aria-live','polite');
const guestStep=document.createElement('fieldset'),guestLegend=document.createElement('legend'),stepper=document.createElement('div'),minus=document.createElement('button'),count=document.createElement('output'),plus=document.createElement('button');
guestStep.className='guest-step';guestStep.setAttribute('aria-label','Guest count');
guestLegend.textContent='Number of guests (including you)';
stepper.className='guest-stepper';minus.type=plus.type='button';minus.className=plus.className='guest-step-button';minus.textContent='−';plus.textContent='+';
minus.setAttribute('aria-label','Remove one guest');plus.setAttribute('aria-label','Add one guest');
count.className='guest-count-value';count.setAttribute('aria-live','polite');count.textContent='1';
stepper.append(minus,count,plus);guestStep.append(guestLegend,stepper);form.querySelector('.ch').after(guestStep);
const total=document.createElement('p');total.className='rsvp-total';total.setAttribute('role','status');total.setAttribute('aria-live','polite');total.textContent='Loading confirmed guest total…';form.after(total);
let guestCount=1,pending=null,sending=false,totalRequest=0;
const updateGuestStep=()=>{const attending=form.querySelector('input[name="a"]:checked').value==='attending';guestStep.hidden=!attending;minus.disabled=guestCount<=1;plus.disabled=guestCount>=10};
const updateTotal=value=>{total.textContent=`Confirmed guests: ${value}`};
const newSubmissionId=()=>{if(!globalThis.crypto?.getRandomValues)throw new Error('Secure submission IDs are unavailable in this browser.');if(globalThis.crypto.randomUUID)return globalThis.crypto.randomUUID();const bytes=new Uint8Array(16);globalThis.crypto.getRandomValues(bytes);return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')};
const clearStatus=()=>{if(!sending)status.textContent=''};
choices.forEach(input=>input.addEventListener('change',updateGuestStep));
form.addEventListener('input',clearStatus);form.addEventListener('change',clearStatus);
minus.addEventListener('click',()=>{guestCount=Math.max(1,guestCount-1);count.textContent=String(guestCount);updateGuestStep();clearStatus()});
plus.addEventListener('click',()=>{guestCount=Math.min(10,guestCount+1);count.textContent=String(guestCount);updateGuestStep();clearStatus()});
name.addEventListener('input',()=>name.setCustomValidity(''));wishes.addEventListener('input',()=>wishes.setCustomValidity(''));
updateGuestStep();
const requestTotal=++totalRequest;
fetch(RSVP_ENDPOINT,{headers:{Accept:'application/json'},cache:'no-store'}).then(async response=>{const data=await response.json();if(!response.ok||data.ok!==true||!Number.isSafeInteger(data.totalConfirmed)||data.totalConfirmed<0)throw new Error('Unable to load confirmed guest total');if(requestTotal===totalRequest)updateTotal(data.totalConfirmed)}).catch(()=>{if(requestTotal===totalRequest)total.textContent='Confirmed guest total is unavailable right now.'});
form.onsubmit=async event=>{
event.preventDefault();if(sending)return;
status.textContent='';
const attendance=form.querySelector('input[name="a"]:checked').value;
name.setCustomValidity(name.value.trim()?'':'Please enter your name.');
wishes.setCustomValidity(attendance!=='wishes_only'||wishes.value.trim()?'':'Please include your wishes.');
if(!form.reportValidity())return;
const payload={name:name.value.trim(),email:email.value.trim(),attendance,guestCount:attendance==='attending'?guestCount:0,wishes:wishes.value.trim()};
let fingerprint;try{fingerprint=JSON.stringify(payload);if(!pending||pending.fingerprint!==fingerprint)pending={fingerprint,id:newSubmissionId()}}catch(error){status.textContent=error.message;return}
payload.submissionId=pending.id;sending=true;status.textContent='Submitting your response…';form.querySelectorAll('input,textarea,button').forEach(control=>control.disabled=true);
try{
const response=await fetch(RSVP_ENDPOINT,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify(payload)});
const data=await response.json();
if(!response.ok||data.ok!==true||!Number.isSafeInteger(data.totalConfirmed)||data.totalConfirmed<0)throw new Error(data.message||'We could not verify that your response was saved.');
pending=null;form.reset();guestCount=1;count.textContent='1';updateGuestStep();totalRequest++;updateTotal(data.totalConfirmed);
status.textContent=data.duplicate?'This response was already recorded. Thank you.':'Thank you, '+payload.name+'! Your response has been recorded. 🙏';
}catch(error){status.textContent=error.name==='Error'?error.message:'We could not verify that your response was saved. Check your connection and try again.'}
finally{form.querySelectorAll('input,textarea,button').forEach(control=>control.disabled=false);sending=false;updateGuestStep()}
};
}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
$('#lb').onclick=()=>$('#lb').style.display='none';
function tick(){const el=$('#cd');if(!el)return;const V=EVS(),i=cur(),now=new Date();let s=Math.max(0,(new Date(V[i].s)-now)/1e3);if(isNaN(s))return;document.querySelectorAll('.ec').forEach((c,j)=>c.classList.toggle('on',j==i));const L=$('#cdl');if(now>new Date(V[1].e)){L.textContent='Thank you for celebrating with us 🙏';el.innerHTML='';return}if(s==0){L.textContent='The '+V[i].n+' is happening now 🎉';el.innerHTML='';return}L.textContent='Countdown to the '+V[i].n;const v=[['Days',s/86400],['Hours',s%86400/3600],['Minutes',s%3600/60],['Seconds',s%60]];el.innerHTML=v.map(([l,n])=>`<div><b>${String(Math.floor(n)).padStart(2,'0')}</b><span>${l}</span></div>`).join('')}setInterval(tick,1000);
function scratch(){const c=$('#sc');if(!c)return;const w=c.parentElement.clientWidth,h=c.parentElement.clientHeight;if(revealed){c.style.display='none';return}c.width=w;c.height=h;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#a9772a');g.addColorStop(.5,'#f2dc8f');g.addColorStop(1,'#a9772a');x.fillStyle=g;x.fillRect(0,0,w,h);
x.fillStyle='#5a1620';x.font='600 15px sans-serif';x.textAlign='center';x.fillText('✦  SCRATCH HERE  ✦',w/2,h/2+5);x.globalCompositeOperation='destination-out';let dn=0;
const p=e=>{const r=c.getBoundingClientRect();x.beginPath();x.arc(e.clientX-r.left,e.clientY-r.top,24,0,7);x.fill()};
c.onpointerdown=e=>{dn=1;c.setPointerCapture(e.pointerId);p(e)};c.onpointermove=e=>dn&&p(e);
c.onpointerup=()=>{dn=0;const d=x.getImageData(0,0,w,h).data;let n=0,t=0;for(let i=3;i<d.length;i+=40){t++;if(!d[i])n++}if(n/t>.4){revealed=1;c.style.transition='opacity .8s';c.style.opacity=0;setTimeout(()=>c.style.display='none',800)}}}
for(let i=0;i<14;i++){const p=document.createElement('div');p.className='pt';p.style.cssText=`left:${Math.random()*100}vw;animation-duration:${9+Math.random()*10}s;animation-delay:-${Math.random()*15}s`;document.body.appendChild(p)}
/* ---------- music ---------- */
let PG=0;const pg=o=>{const w=PG;PG=o;document.body.classList.toggle('opened',!!o);if(o&&!w){scrollTo(0,0);startMusic()}if(o)setTimeout(scratch,80)};const BGM='assets/audio/background-music.mp3';let ac,mg,muted=false,started=0;const aud=new Audio();aud.loop=true;if(BGM)aud.src=BGM;aud.onerror=()=>{aud.removeAttribute('src');startMusic()};
try{muted=localStorage.getItem('inv-mute')=='1'}catch(e){}
function synth(){if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();mg=ac.createGain();mg.gain.value=.55;const d=ac.createDelay(),fb=ac.createGain(),lp=ac.createBiquadFilter();d.delayTime.value=.45;fb.gain.value=.4;d.connect(fb);fb.connect(d);lp.frequency.value=1800;mg.connect(lp);lp.connect(ac.destination);lp.connect(d);d.connect(ac.destination);
[65.4,98,130.8].forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=f;g.gain.value=.06/(i+1);o.connect(g);g.connect(mg);o.start()});
const sc=[261.6,293.7,329.6,392,440,523.3,587.3];
setInterval(()=>{if(ac.state!='running')return;const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;o.frequency.value=sc[Math.random()*7|0];g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.12,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+3);o.connect(g);g.connect(mg);o.start(t);o.stop(t+3.2)},1800)}ac.resume()}
function synth2(){if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();mg=ac.createGain();mg.gain.value=.7;
const lp=ac.createBiquadFilter(),d=ac.createDelay(),fb=ac.createGain(),wet=ac.createGain();lp.type='lowpass';lp.frequency.value=2600;d.delayTime.value=.38;fb.gain.value=.38;wet.gain.value=.35;
mg.connect(lp);lp.connect(ac.destination);lp.connect(d);d.connect(fb);fb.connect(d);d.connect(wet);wet.connect(ac.destination);
const tone=(f,t,dur,type,vol,att,rel,vib)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;
if(vib){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=5.2;lg.gain.value=f*.006;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+dur+rel)}
g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+att);g.gain.setValueAtTime(vol,t+Math.max(att,dur-.05));g.gain.exponentialRampToValueAtTime(.0008,t+dur+rel);o.connect(g);g.connect(mg);o.start(t);o.stop(t+dur+rel+.1)};
const S=130.8,tp=[S*.75,S,S,S/2];let n=0;
setInterval(()=>{if(ac.state!='running')return;const t=ac.currentTime,f=tp[n++%4];tone(f,t,.1,'sawtooth',.05,.01,3.2);tone(f*2,t,.05,'triangle',.02,.01,2.4)},1250);
const sc=[1,1.125,1.25,1.5,1.667],sa=261.6;let deg=0,busy=0;
const phrase=()=>{if(ac.state!='running'||busy)return;busy=1;let t=ac.currentTime+.1;const len=4+(Math.random()*4|0);
for(let i=0;i<len;i++){deg+=Math.random()<.5?-1:1;if(Math.random()<.2)deg+=Math.random()<.5?-1:1;deg=Math.max(-2,Math.min(8,deg));
const o=Math.floor(deg/5),k=((deg%5)+5)%5,f=sa*sc[k]*Math.pow(2,o),dur=.5+Math.random()*1.1;tone(f,t,dur,'sine',.11,.09,.5,1);tone(f*2,t,dur,'triangle',.015,.09,.4);t+=dur+.05}
tone(sa,t,2,'sine',.1,.12,1.5,1);deg=0;setTimeout(()=>busy=0,(t-ac.currentTime+2.8+Math.random()*3)*1000)};
setInterval(phrase,1500)}ac.resume()}
function startMusic(){try{if(muted)return;if(aud.getAttribute('src')){ac&&ac.suspend();aud.play().catch(()=>{})}else synth2()}catch(e){}}
function setMute(m){muted=m;try{localStorage.setItem('inv-mute',m?'1':'0')}catch(e){}$('#mu').classList.toggle('off',m);if(m){aud.pause();ac&&ac.suspend()}else startMusic()}
$('#mu').onclick=()=>setMute(!muted);$('#mu').classList.toggle('off',muted);
const EVT=['pointerdown','pointerup','touchend','click','keydown'];
const playing=()=>(ac&&ac.state=='running')||(aud.getAttribute('src')&&!aud.paused);
const go=()=>{if(muted)return;startMusic();setTimeout(()=>{if(playing())EVT.forEach(v=>removeEventListener(v,go,true))},500)};
/* 1) try to play the moment the page opens (works wherever the browser allows autoplay)
   2) if blocked, start on the very first touch / click / key, anywhere on the page */
EVT.forEach(v=>addEventListener(v,go,true));
aud.preload='auto';startMusic();addEventListener('load',()=>{if(!muted&&!playing())startMusic()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!muted&&!playing())startMusic()});
const mh=document.createElement('div');mh.id='mh';mh.textContent='\u266A Tap anywhere for music';document.body.appendChild(mh);
setInterval(()=>mh.classList.toggle('on',!muted&&!playing()),600);
/* full-screen: browsers only allow it after a tap/click, so it starts on the very first one */
(function(){const E=['click','touchend'],rf=()=>{const e=document.documentElement,f=e.requestFullscreen||e.webkitRequestFullscreen;E.forEach(v=>removeEventListener(v,rf,true));if(!f||document.fullscreenElement||document.webkitFullscreenElement)return;try{const r=f.call(e,{navigationUI:'hide'});r&&r.catch&&r.catch(()=>{})}catch(x){}};E.forEach(v=>addEventListener(v,rf,true))})();
render();addEventListener('resize',()=>{if(!revealed)scratch()});