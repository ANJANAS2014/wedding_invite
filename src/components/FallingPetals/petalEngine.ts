// @ts-nocheck -- canvas engine ported 1:1 from Claude outputs/petal-shower-3d-mockup.html
/* Premium Rose & Gold petal shower: curved 3-D petals, depth layers, wind,
   scroll/touch response, welcome shower and blessings burst. */
export interface PetalShowerApi {
  start(): void;
  stop(): void;
  shower(n: number): void;
  burst(x: number, y: number, n: number): void;
}

export function createPetalShower(cv: HTMLCanvasElement): PetalShowerApi {
  const ctx=cv.getContext('2d');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canBlur='filter' in ctx;
  const SW=128,SH=144;            // sprite box (petal drawn in a 100x120 unit, centred)
  let W=0,H=0,dpr=1;

  /* ---------- shape library ---------- */
  const shapes={
    rose(c){c.beginPath();c.moveTo(50,116);c.bezierCurveTo(22,108,6,80,8,52);c.bezierCurveTo(10,26,26,8,40,6);
      c.bezierCurveTo(45,5,48,10,50,14);c.bezierCurveTo(52,10,55,5,60,6);c.bezierCurveTo(74,8,90,26,92,52);
      c.bezierCurveTo(94,80,78,108,50,116);c.closePath();},
    lotus(c){c.beginPath();c.moveTo(50,116);c.bezierCurveTo(22,96,20,48,50,4);c.bezierCurveTo(80,48,78,96,50,116);c.closePath();},
    jasmine(c){c.beginPath();c.moveTo(50,116);c.bezierCurveTo(38,100,30,62,33,32);c.bezierCurveTo(36,12,45,4,50,4);
      c.bezierCurveTo(55,4,64,12,67,32);c.bezierCurveTo(70,62,62,100,50,116);c.closePath();},
    marigold(c){c.beginPath();c.moveTo(50,116);const n=40;
      for(let i=0;i<=n;i++){const a=(-40+80*i/n)*Math.PI/180,r=98+5*Math.sin(i*1.9)+3*Math.cos(i*3.3);c.lineTo(50+Math.sin(a)*r*0.62,116-Math.cos(a)*r);}
      c.closePath();},
    gold(c,seed){c.beginPath();let s=seed||1;const R=()=>(s=(s*16807)%2147483647)/2147483647;const n=7;
      for(let i=0;i<n;i++){const a=i/n*Math.PI*2+R()*0.5,r=26+R()*22;c[i?'lineTo':'moveTo'](50+Math.cos(a)*r,60+Math.sin(a)*r*0.8);}c.closePath();}
  };

  /* ---------- painters: front & back faces ---------- */
  /* Curved petal: the inner (concave) face shows a shadowed cup with a rolled, lit lip;
     the outer (convex) face shows a lit central ridge. Together with the edge-on profile
     sprite and a moving specular highlight this gives a 3-D, not paper-flat, petal. */
  function paintPetal(c,kind,col,back){
    const P=()=>shapes[kind](c,col.seed);
    P();
    let g=c.createRadialGradient(50,112,4,50,70,104);g.addColorStop(0,col.base);g.addColorStop(.55,col.mid);g.addColorStop(1,col.tip);
    c.save();c.shadowColor='rgba(90,20,35,.32)';c.shadowBlur=10;c.shadowOffsetX=back?-2:2;c.shadowOffsetY=5;c.fillStyle=g;c.fill();c.restore();
    c.save();P();c.clip();
    if(!back){
      // cylindrical cup shading across the width (light from upper-left)
      let x=c.createLinearGradient(4,0,96,0);
      x.addColorStop(0,'rgba(255,230,236,.30)');x.addColorStop(.18,'rgba(255,255,255,0)');
      x.addColorStop(.5,'rgba(70,0,22,.24)');x.addColorStop(.82,'rgba(70,0,22,.10)');x.addColorStop(1,'rgba(255,215,225,.22)');
      c.fillStyle=x;c.fillRect(0,0,100,120);
      // deep pinch at the base where the petal curves most
      let b=c.createRadialGradient(50,116,0,50,108,46);b.addColorStop(0,'rgba(60,0,20,.45)');b.addColorStop(1,'rgba(60,0,20,0)');
      c.fillStyle=b;c.fillRect(0,0,100,120);
      // light caught on the raised inner wall
      let h=c.createRadialGradient(30,46,0,30,46,30);h.addColorStop(0,'rgba(255,238,242,.30)');h.addColorStop(1,'rgba(255,238,242,0)');
      c.fillStyle=h;c.fillRect(0,0,100,120);
      // veins, fanning and bending with the cup
      c.strokeStyle='rgba(255,235,240,.08)';c.lineWidth=.7;
      for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(50,114);c.bezierCurveTo(50+i*3,84,50+i*9,46,50+i*13.5,12);c.stroke();}
      // centre crease: thin shadow with a highlight beside it
      c.lineWidth=1.6;c.strokeStyle='rgba(80,0,25,.22)';c.beginPath();c.moveTo(50,112);c.quadraticCurveTo(49,80,51,48);c.stroke();
      c.lineWidth=1.2;c.strokeStyle='rgba(255,240,244,.25)';c.beginPath();c.moveTo(52.5,110);c.quadraticCurveTo(52,80,54,50);c.stroke();
      // rolled lip along the outer (top) edge: soft shadow inside, light band on the rim
      c.save();c.beginPath();c.rect(0,0,100,78);c.clip();
      P();c.lineWidth=16;c.strokeStyle='rgba(75,0,24,.16)';c.stroke();
      P();c.lineWidth=4.5;c.strokeStyle='rgba(255,228,236,.32)';c.stroke();c.restore();
    }else{
      // convex outer face: lit central ridge, edges falling into shade, more matte
      let x=c.createLinearGradient(4,0,96,0);
      x.addColorStop(0,'rgba(55,0,18,.34)');x.addColorStop(.42,'rgba(255,236,240,.22)');
      x.addColorStop(.55,'rgba(255,236,240,.10)');x.addColorStop(1,'rgba(55,0,18,.38)');
      c.fillStyle=x;c.fillRect(0,0,100,120);
      c.fillStyle='rgba(60,10,25,.10)';c.fillRect(0,0,100,120);
      c.strokeStyle='rgba(60,0,20,.08)';c.lineWidth=.8;
      for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(50,114);c.bezierCurveTo(50+i*3,84,50+i*9,46,50+i*14,14);c.stroke();}
    }
    c.restore();
    P();c.strokeStyle=col.rim;c.lineWidth=1.2;c.stroke();
  }
  // edge-on profile: a curved sliver, so a turning petal never collapses to a flat line
  function paintEdge(c,col){
    c.beginPath();c.moveTo(50,116);c.bezierCurveTo(26,92,24,40,46,6);c.bezierCurveTo(48,6,49,7,49,8);
    c.bezierCurveTo(36,42,38,88,50,116);c.closePath();
    let g=c.createLinearGradient(0,116,0,6);g.addColorStop(0,col.base);g.addColorStop(.6,col.mid);g.addColorStop(1,col.tip);
    c.save();c.shadowColor='rgba(90,20,35,.3)';c.shadowBlur=8;c.shadowOffsetY=4;c.fillStyle=g;c.fill();c.restore();
    c.beginPath();c.moveTo(48,112);c.bezierCurveTo(28,90,27,42,45,10);c.strokeStyle='rgba(255,230,238,.55)';c.lineWidth=2;c.stroke();
  }
  // moving specular: an elongated glint along the curve, faded in by the flip angle
  function paintSpec(c){
    c.save();c.translate(62,52);c.rotate(.12);c.scale(1,2.6);
    const g=c.createRadialGradient(0,0,0,0,0,13);g.addColorStop(0,'rgba(255,246,248,.9)');g.addColorStop(.45,'rgba(255,230,238,.35)');g.addColorStop(1,'rgba(255,230,238,0)');
    c.fillStyle=g;c.beginPath();c.arc(0,0,13,0,7);c.fill();c.restore();
  }
  function paintGold(c,col,back){
    shapes.gold(c,col.seed);
    const g=c.createLinearGradient(10,20,90,100);
    if(back){g.addColorStop(0,'#7a5a1e');g.addColorStop(.5,'#b58c3c');g.addColorStop(1,'#6f501a');}
    else{g.addColorStop(0,'#9a7224');g.addColorStop(.3,'#f7e3a1');g.addColorStop(.5,'#c9a14a');g.addColorStop(.72,'#fff4c9');g.addColorStop(1,'#a37a2c');}
    c.fillStyle=g;c.fill();
    c.save();c.clip();c.strokeStyle='rgba(120,80,20,.35)';c.lineWidth=.8;
    c.beginPath();c.moveTo(30,40);c.lineTo(55,62);c.lineTo(70,50);c.moveTo(42,80);c.lineTo(58,66);c.stroke();c.restore();
  }
  function paintGlint(c){const g=c.createRadialGradient(50,60,0,50,60,46);g.addColorStop(0,'rgba(255,250,225,.95)');g.addColorStop(.25,'rgba(255,230,160,.45)');g.addColorStop(1,'rgba(255,220,140,0)');c.fillStyle=g;c.fillRect(0,0,100,120);}

  function sprite(paint,blur){
    const s=document.createElement('canvas');s.width=SW;s.height=SH;const c=s.getContext('2d');
    if(blur&&canBlur)c.filter=`blur(${blur}px)`;
    c.translate((SW-100)/2,(SH-120)/2);paint(c);return s;
  }

  /* ---------- palettes ---------- */
  const PAL={
    rose:{name:'Rose & Gold',items:[
      {k:'rose',w:3,c:{base:'#8e1834',mid:'#d04d69',tip:'#f7b9c7',rim:'rgba(110,15,40,.30)'}},
      {k:'rose',w:3,c:{base:'#b8304f',mid:'#ea84a0',tip:'#fde3ea',rim:'rgba(140,35,65,.24)'}},
      {k:'rose',w:2,c:{base:'#6e0f2a',mid:'#ad2848',tip:'#e5768f',rim:'rgba(70,8,28,.32)'}},
      {k:'gold',w:1.3,c:{seed:7}},{k:'gold',w:1,c:{seed:91}}]}
  };
  const BLUR=[1.6,0,3.2];           // far, mid, near
  let palKey='rose',kinds=[],glint;

  function buildSprites(){
    kinds=PAL[palKey].items.map(it=>{
      const isGold=it.k==='gold';
      const f=c=>isGold?paintGold(c,it.c,false):paintPetal(c,it.k,it.c,false);
      const b=c=>isGold?paintGold(c,it.c,true):paintPetal(c,it.k,it.c,true);
      const K={w:it.w,gold:isGold,front:BLUR.map(bl=>sprite(f,bl)),back:BLUR.map(bl=>sprite(b,bl))};
      if(!isGold){K.edge=BLUR.map(bl=>sprite(c=>paintEdge(c,it.c),bl));K.spec=BLUR.map(bl=>sprite(paintSpec,bl));}
      return K;
    });
    glint=sprite(paintGlint,0);
  }
  function pickKind(){const tot=kinds.reduce((a,k)=>a+k.w,0);let r=Math.random()*tot;for(let i=0;i<kinds.length;i++){r-=kinds[i].w;if(r<=0)return i;}return 0;}

  /* ---------- particles ---------- */
  let ps=[],density='festive';
  const rnd=(a,b)=>a+Math.random()*(b-a);
  function target(){const base=W*H/(density==='calm'?46000:24000);return Math.round(Math.max(density==='calm'?14:24,Math.min(density==='calm'?30:56,base)));}

  function make(opts={}){
    const r=Math.random(),layer=r<.55?0:r<.9?1:2;      // 55% far / 35% mid / 10% near
    const ki=pickKind(),gold=kinds[ki].gold;
    const z=layer===0?rnd(0,.35):layer===1?rnd(.4,.75):rnd(.85,1);
    const size=(layer===0?rnd(10,14):layer===1?rnd(18,26):rnd(36,48))*(gold?.62:1);
    return Object.assign({
      ki,layer,z,size,
      x:rnd(-40,W+40),y:opts.y!=null?opts.y:rnd(-H,H),
      vy:(layer===0?rnd(26,38):layer===1?rnd(42,62):rnd(78,104)),
      sway:rnd(10,26)*(.6+z),swf:rnd(.5,1.1),ph:rnd(0,6.28),
      rz:rnd(0,6.28),vrz:rnd(-.7,.7),flip:rnd(0,6.28),vflip:rnd(1.2,2.6)*(Math.random()<.5?-1:1),
      tilt:rnd(0,6.28),vtilt:rnd(.6,1.4),
      alpha:layer===0?rnd(.5,.65):layer===1?rnd(.85,.95):rnd(.55,.7),
      ix:0,iy:0,bvx:0,bvy:0,burst:false,temp:false,born:performance.now()
    },opts);
  }
  function sortZ(){ps.sort((a,b)=>a.z-b.z);}
  function fill(){const n=target();while(ps.filter(p=>!p.temp).length<n)ps.push(make());
    let extra=ps.filter(p=>!p.temp).length-n;ps=ps.filter(p=>p.temp||extra--<=0);sortZ();}

  /* ---------- environment ---------- */
  let t=0,last=0,gust=0,gustT=6,running=false,raf=0;
  const ptr={x:-999,y:-999,vx:0,vy:0,on:false};
  function wind(){return 8+10*Math.sin(t*.13)+6*Math.sin(t*.37+1.3)+gust;}

  function step(dt){
    t+=dt;
    gustT-=dt;if(gustT<=0){gust=rnd(22,42)*(Math.random()<.8?1:-1);gustT=rnd(9,16);}
    gust*=Math.exp(-.45*dt);
    const w=wind(),pd=ptr.on;
    for(let i=ps.length-1;i>=0;i--){
      const p=ps[i];
      // drag: flat petals float, edge-on petals drop
      const fall=p.vy*(.55+.6*Math.abs(Math.sin(p.flip)));
      if(p.burst){p.bvy+=420*dt;p.bvx*=Math.exp(-1.6*dt);if(p.bvy>=fall){p.burst=false;}}
      const vy=p.burst?p.bvy:fall;
      const vx=w*(.35+.85*p.z)+Math.cos(t*p.swf+p.ph)*p.sway+(p.burst?p.bvx:0);
      // cursor / finger brush
      if(pd&&p.layer>0){const dx=p.x-ptr.x,dy=p.y-ptr.y,d2=dx*dx+dy*dy,R=120;
        if(d2<R*R){const d=Math.sqrt(d2)||1,f=(1-d/R);p.ix+=(dx/d*260+ptr.vx*.35)*f*dt*6;p.iy+=(dy/d*160+ptr.vy*.25)*f*dt*6;p.vrz+=f*dt*4*(dx>0?1:-1);}}
      p.ix*=Math.exp(-2.6*dt);p.iy*=Math.exp(-2.6*dt);p.vrz=p.vrz*Math.exp(-.3*dt)+(Math.sin(t*p.swf+p.ph)*.25)*dt;
      p.x+=(vx+p.ix)*dt;p.y+=(vy+p.iy)*dt;
      p.rz+=p.vrz*dt+Math.cos(t*p.swf+p.ph)*.35*dt;p.flip+=p.vflip*dt;p.tilt+=p.vtilt*dt;
      if(p.y>H+60){ if(p.temp){ps.splice(i,1);continue;} Object.assign(p,make({y:rnd(-80,-30)}),{z:p.z,layer:p.layer}); p.x=w>18?rnd(-W*.25,W*.9):rnd(-30,W+30);}
      if(p.x>W+60)p.x=-50;else if(p.x<-60)p.x=W+50;
    }
    ptr.vx*=.85;ptr.vy*=.85;
  }

  const smooth=(a,b,x)=>{x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x);};
  function draw(){
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);
    for(const p of ps){
      const K=kinds[p.ki];if(!K)continue;
      const fx=Math.cos(p.flip),ax=Math.abs(fx),sgn=fx<0?-1:1,sy=.8+.2*Math.cos(p.tilt);
      const k=p.size/100,cr=Math.cos(p.rz),sr=Math.sin(p.rz),L=p.layer;
      const fade=Math.max(0,Math.min(1,(p.y+40)/80)),A=p.alpha*fade;
      const put=(kx)=>ctx.setTransform(cr*kx*dpr,sr*kx*dpr,-sr*k*sy*dpr,cr*k*sy*dpr,p.x*dpr,p.y*dpr);
      if(K.gold){
        put(sgn*Math.max(.07,ax)*k);ctx.globalAlpha=A;ctx.drawImage(fx>=0?K.front[L]:K.back[L],-SW/2,-SH/2);
        const g=Math.pow(Math.max(0,Math.cos(p.flip+p.tilt*.5)),14);
        if(fx>0&&g>.04){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=g*.85*fade;ctx.drawImage(glint,-SW/2,-SH/2);ctx.globalCompositeOperation='source-over';}
        continue;
      }
      // face (foreshortened) fades out as the petal turns edge-on ...
      const ea=1-smooth(.26,.5,ax);
      if(ea>0){put(sgn*k*(.9+.25*ax));ctx.globalAlpha=A*ea;ctx.drawImage(K.edge[L],-SW/2,-SH/2);}
      const fa=smooth(.12,.32,ax);
      if(fa>0){put(sgn*Math.max(.12,ax)*k);ctx.globalAlpha=A*fa;ctx.drawImage(fx>=0?K.front[L]:K.back[L],-SW/2,-SH/2);
        // ... with a glint that slides in as the curve catches the light
        const sp=fx>=0?Math.pow(Math.max(0,Math.cos(p.flip-.55)),5)*.55:Math.pow(Math.max(0,-Math.cos(p.flip+.4)),6)*.28;
        if(sp>.03){ctx.globalCompositeOperation='screen';ctx.globalAlpha=sp*fade*fa;ctx.drawImage(K.spec[L],-SW/2,-SH/2);ctx.globalCompositeOperation='source-over';}
      }
          }
    ctx.globalAlpha=1;
  }

  function loop(now){
    const dt=Math.min(.05,(now-last)/1000||0);last=now;
    step(dt);draw();raf=requestAnimationFrame(loop);
  }

  function resize(){
    dpr=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;
    cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);fill();if(!running)draw();
  }

  /* ---------- moments ---------- */
  function shower(n){                 // welcome shower: a soft flurry from the top
    if(reduce)return;
    for(let i=0;i<n;i++){const p=make({temp:true,y:-rnd(20,H*.9)});p.vy*=1.25;p.alpha=Math.min(1,p.alpha+.08);ps.push(p);}sortZ();
  }
  function burst(x,y,n){              // blessings burst: cone upward from a point, then flutter down
    if(reduce)return;
    for(let i=0;i<n;i++){const a=(-90+rnd(-48,48))*Math.PI/180,sp=rnd(380,760);
      const p=make({temp:true,x:x+rnd(-10,10),y:y+rnd(-6,6)});
      if(p.layer===2&&Math.random()<.6)p.layer=1;
      p.burst=true;p.bvx=Math.cos(a)*sp;p.bvy=Math.sin(a)*sp;p.vflip*=2;ps.push(p);}
    sortZ();
  }

  /* ---------- wiring ---------- */
  let sy0=scrollY;
  addEventListener('scroll',()=>{const d=Math.max(-120,Math.min(120,scrollY-sy0));sy0=scrollY;
    for(const p of ps){p.y-=d*(.08+.5*p.z);}},{passive:true});
  addEventListener('pointermove',e=>{ptr.vx=(e.clientX-ptr.x)*(ptr.on?1:0);ptr.vy=(e.clientY-ptr.y)*(ptr.on?1:0);ptr.x=e.clientX;ptr.y=e.clientY;ptr.on=true;},{passive:true});
  addEventListener('pointerleave',()=>{ptr.on=false;});
  document.addEventListener('pointerout',e=>{if(!e.relatedTarget)ptr.on=false;});
  addEventListener('resize',resize);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});

  function start(){if(running||reduce)return;running=true;last=performance.now();raf=requestAnimationFrame(loop);}
  function stop(){running=false;cancelAnimationFrame(raf);}
  function setPalette(k){palKey=k;buildSprites();ps=[];fill();if(!running)draw();}
  function setDensity(d){density=d;fill();}

  buildSprites();resize();
  if(reduce){ps=ps.filter(p=>p.y>0&&p.y<H).slice(0,10);draw();}
  return {start,stop,shower,burst};
}
