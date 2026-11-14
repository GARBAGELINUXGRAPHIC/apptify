interface Point { x: number; y: number }
export interface GatewaySnapshot {
  seconds: number
  phase: number
  intro: boolean
  zoom: number
  bug: Point & { angle: number; scale: number; visible: boolean; captured: boolean }
  mouth: Point
  tip: Point
  tongueVisible: boolean
  contact: number
  shoot: number
  retractEnd: number
  period: number
  introEnd: number
}
export interface GatewayStory {
  seek(seconds: number): GatewaySnapshot
  play(): void
  pause(): void
  replay(): void
  getState(): GatewaySnapshot
  setReducedMotion(value: boolean): void
  dispose(): void
  timing: Readonly<{ contact: number; shoot: number; retractEnd: number; period: number; introEnd: number; initialPhase: number; zoomStart: number }>
}
type GatewayArt = SVGSVGElement & { gatewayStory?: GatewayStory }

export function createGatewayStory(svg: GatewayArt, reducedMotion = false): GatewayStory {
  const get = (name: string) => {
    const el = svg.querySelector<SVGElement>(`[data-part="${name}"]`);
    if (!el) throw new Error(`Missing gateway part: ${name}`);
    return el;
  };
  const parts = Object.fromEntries([
    'camera','bug','bug-pitch','bug-bag','bug-legs','wing-front','wing-back','bug-shadow',
    'frog-torso','frog-head','frog-throat','eye-left','eye-right','pupil-left','pupil-right',
    'mouth-closed','mouth-open','mouth-cavity','mouth-inner','lip-head','lip-front',
    'tongue','tongue-edge','tongue-fill','tongue-shine','tongue-tip','flag-keep','flag-town'
  ].map(name => [name, get(name)]));
  const clamp = (x: number, a=0, b=1) => Math.max(a, Math.min(b, x));
  const mix = (a: number,b: number,t: number) => a+(b-a)*t;
  const smooth = (x: number) => { x=clamp(x); return x*x*(3-2*x); };
  const segment = (t: number,a: number,b: number) => smooth((t-a)/(b-a));
  const pulse = (t: number,a: number,b: number) => t>a && t<b ? Math.sin(Math.PI*(t-a)/(b-a)) ** 2 : 0;
  const attr = (name: string,key: string,value: string | number) => parts[name].setAttribute(key,String(value));
  const show = (name: string, yes: boolean) => attr(name,'display',yes?'inline':'none');
  const n = (x: number) => Number(x.toFixed(4));
  const root = {x:636, y:539};
  const speed=174, startX=-130, catchX=500;
  const contact=(catchX-startX)/speed;
  const shoot=contact-.155;
  const retractEnd=contact+.37;
  const period=4.85;
  const initialPhase=1.25;
  const zoomStart=retractEnd-initialPhase+.18;
  const introEnd=zoomStart+1.55;
  const flight = (t: number) => {
    const x=startX+speed*t;
    const y=408+11*Math.sin(x*.010+.6)+4*Math.sin(x*.032+.4)-.018*(x-400);
    const dy=11*.010*Math.cos(x*.010+.6)+4*.032*Math.cos(x*.032+.4)-.018;
    return {x,y,angle:Math.atan2(dy,1)*180/Math.PI*.48};
  };
  const hit=flight(contact);
  const bezier = (a: number,b: number,c: number,d: number,t: number) => (1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d;
  let disposed=false, raf=0, clock=0, lastNow=0, userPaused=false;
  let inView=true;
  let observer: IntersectionObserver | undefined;
  let snapshot: GatewaySnapshot | undefined;

  function render(seconds: number): GatewaySnapshot {
    const intro=seconds<introEnd;
    const t=intro ? Math.min(initialPhase+seconds,period-.01) : (seconds-introEnd)%period;
    const anticipating=segment(t,shoot-.25,shoot)*(1-segment(t,shoot,shoot+.12));
    const action=pulse(t,shoot,retractEnd+.10);
    const gulp=pulse(t,retractEnd+.08,retractEnd+.42);

    const hx=-3.5*action, hy=1.5*anticipating-1.5*action+.7*gulp;
    const headAngle=-1.0*action;
    const headTransform=`translate(${n(hx)} ${n(hy)}) rotate(${n(headAngle)} 0 -100)`;
    attr('frog-head','transform',headTransform);
    attr('lip-head','transform',headTransform);
    attr('frog-torso','transform',`scale(${n(1+.008*anticipating)} ${n(1-.016*anticipating+.004*Math.sin(seconds*1.8))})`);
    attr('frog-throat','transform',`translate(0 -57) scale(${n(1+.035*gulp)} ${n(1+.055*gulp)}) translate(0 57)`);

    const rad=headAngle*Math.PI/180;
    const localMouth={x:-2, y:-90};
    const mouth={x:root.x+hx+localMouth.x*Math.cos(rad)-(localMouth.y+100)*Math.sin(rad),
                 y:root.y+hy-100+localMouth.x*Math.sin(rad)+(localMouth.y+100)*Math.cos(rad)};
    let bug=flight(Math.min(t,contact)), scale=1, pitch=bug.angle, captured=false;
    let tip={...mouth}, tongueVisible=false, retract=0;
    if(t>=shoot && t<contact) {
      const u=clamp((t-shoot)/(contact-shoot));
      const extension=1-(1-u)**2;
      tip={x:mix(mouth.x,hit.x,extension), y:mix(mouth.y,hit.y,extension)};
      tongueVisible=true;
    } else if(t>=contact && t<retractEnd) {
      retract=clamp((t-contact)/(retractEnd-contact));
      const u=retract;


      bug={x:bezier(hit.x,hit.x+23,mouth.x-22,mouth.x,u),
           y:bezier(hit.y,hit.y+2,mouth.y-12,mouth.y,u), angle:0};
      scale=1-smooth((u-.79)/.21);
      pitch=mix(hit.angle,20,smooth(u));
      tip={x:bug.x,y:bug.y};
      tongueVisible=true;
      captured=true;
    }
    const visible=t<retractEnd && scale>.0001;
    show('bug',visible);

    if(visible) {
      attr('bug','transform',`translate(${n(bug.x)} ${n(bug.y)}) scale(${n(scale)})`);
      attr('bug-pitch','transform',`rotate(${n(pitch)})`);
    }
    const wing=2*Math.PI*11.3*seconds;
    const flutter=captured?1.2:1;
    attr('wing-front','transform',`translate(-5 -9) rotate(${n(-18+35*Math.sin(wing)*flutter)}) scale(1 ${n(.45+.55*Math.abs(Math.cos(wing)))}) translate(5 9)`);
    attr('wing-back','transform',`translate(-5 -8) rotate(${n(18-33*Math.sin(wing+.9)*flutter)}) scale(1 ${n(.55+.45*Math.abs(Math.cos(wing+.9)))}) translate(5 8)`);
    attr('bug-bag','transform',`rotate(${n(captured?-16*smooth(retract):5.5*Math.sin(seconds*5.1-.9)-3)} -22 -2)`);
    attr('bug-legs','d',captured?'M-19 8-26 10m16 0-5 8m23-7 7 5':`M-19 8-28 ${n(18+2*Math.sin(seconds*8))}m18-8-2 13m20-12 8 10`);
    show('bug-shadow',visible && !captured);
    attr('bug-shadow','cx',n(bug.x));
    attr('bug-shadow','rx',n(18+(bug.y-400)*.06));

    const look=t<contact?clamp((bug.x-root.x)/120,-1,1):(1-segment(t,retractEnd,retractEnd+.55))*-.45;
    const lookY=t<contact?clamp((bug.y-(root.y-140))/80,-1,1):.15;
    for(const name of ['pupil-left','pupil-right']) attr(name,'transform',`translate(${n(look*3.8)} ${n(lookY*2)})`);
    const blink=1-.94*Math.max(pulse(t,retractEnd+.12,retractEnd+.36),pulse(t,.53,.70));
    attr('eye-left','transform',`translate(-44 -140) scale(1 ${n(blink)})`);
    attr('eye-right','transform',`translate(44 -140) scale(1 ${n(blink)})`);
    const opening=segment(t,shoot-.09,shoot+.035)*(1-segment(t,retractEnd-.015,retractEnd+.13));
    const w=10+10*opening, bottom=-94+18*opening;
    show('mouth-closed',opening<.03);
    show('mouth-open',opening>=.03);
    attr('mouth-cavity','d',`M${-w} -96Q0 ${n(-98-2*opening)} ${w} -96Q${n(w+1)} ${n(bottom)} 0 ${n(bottom)}Q${n(-w-1)} ${n(bottom)} ${-w} -96Z`);
    attr('mouth-inner','d',`M${n(-12*opening)} ${n(bottom-2*opening)}Q0 ${n(bottom-7*opening)} ${n(12*opening)} ${n(bottom-2*opening)}Q0 ${n(bottom)} ${n(-12*opening)} ${n(bottom-2*opening)}Z`);
    attr('lip-front','d',opening<.03?'M-24-92Q0-82 25-92':`M${n(-w-1)} ${n(bottom-5)}Q0 ${n(bottom+6)} ${n(w+1)} ${n(bottom-5)}`);
    attr('lip-front','stroke-width',opening<.03?1.5:4.5);
    show('tongue',tongueVisible);
    if(tongueVisible) {

      const length=Math.hypot(tip.x-mouth.x,tip.y-mouth.y);
      const bend=Math.min(7,length*.035)*(captured?Math.sin(retract*Math.PI):.45);
      const path=(offset: number)=>`M${n(mouth.x)} ${n(mouth.y+offset)} Q${n((mouth.x+tip.x)/2)} ${n((mouth.y+tip.y)/2+bend+offset)} ${n(tip.x)} ${n(tip.y+offset)}`;
      const thickness=clamp(length/14);
      attr('tongue-edge','stroke-width',n(12*thickness)); attr('tongue-fill','stroke-width',n(8.2*thickness)); attr('tongue-shine','stroke-width',n(1.3*thickness));
      attr('tongue-edge','d',path(thickness)); attr('tongue-fill','d',path(0)); attr('tongue-shine','d',path(-2.5*thickness));
      attr('tongue-tip','transform',`translate(${n(tip.x)} ${n(tip.y)}) rotate(${n(Math.atan2(tip.y-mouth.y,tip.x-mouth.x)*180/Math.PI)}) scale(${n(Math.min(1,length/10))})`);
    }
    attr('flag-keep','transform',`translate(1014 127) skewY(${n(Math.sin(seconds*2)*2)}) translate(-1014 -127)`);
    attr('flag-town','transform',`translate(955 225) skewY(${n(Math.sin(seconds*2+.8)*2)}) translate(-955 -225)`);
    let zoom=1, focus={x:600,y:360};
    if(intro) {
      const out=segment(seconds,zoomStart,introEnd);
      const focusBug=t<retractEnd?bug:mouth;
      zoom=mix(3.05,1,out);
      focus={x:mix(focusBug.x-8,600,out),y:mix(focusBug.y-13,360,out)};
    }
    attr('camera','transform',`translate(600 360) scale(${n(zoom)}) translate(${n(-focus.x)} ${n(-focus.y)})`);
    svg.dataset.story=reducedMotion ? "static" : intro ? "intro" : "loop";
    snapshot={seconds,phase:t,intro,zoom,bug:{...bug,scale,visible,captured},mouth,tip,tongueVisible,contact,shoot,retractEnd,period,introEnd};
    return snapshot;
  }
  const allowed=()=>!disposed&&!userPaused&&!document.hidden&&inView&&!reducedMotion;
  function stopRAF() { if(raf) cancelAnimationFrame(raf); raf=0; lastNow=0; }
  function tick(now: number) {
    raf=0; if(!allowed()) {lastNow=0;return;}
    if(lastNow) clock+=Math.min((now-lastNow)/1000,.08);
    lastNow=now; render(clock); raf=requestAnimationFrame(tick);
  }
  function sync() { svg.dataset.playing=String(allowed()); if(allowed()) {if(!raf) {lastNow=0;raf=requestAnimationFrame(tick);}} else stopRAF(); }
  document.addEventListener('visibilitychange',sync);
  if('IntersectionObserver' in window) {
    observer=new IntersectionObserver(entries=>{inView=entries[0]?.isIntersecting??true;sync();},{threshold:0});
    observer.observe(svg);
  }
  render(reducedMotion ? introEnd+2.7 : 0);
  const controller={
    seek(seconds: number){if(!Number.isFinite(seconds)||seconds<0) throw new RangeError('seconds must be finite and non-negative');userPaused=true;sync();clock=seconds;return render(clock);},
    play(){userPaused=false;sync();},
    pause(){userPaused=true;sync();},
    replay(){clock=0;lastNow=0;render(clock);sync();},
    getState(){return snapshot!;},
    setReducedMotion(value: boolean) {
      if (reducedMotion === value) return;
      reducedMotion = value;
      clock = value ? introEnd + 2.7 : Math.max(clock, introEnd);
      render(clock);
      sync();
    },
    dispose(){if(disposed)return;disposed=true;stopRAF();svg.dataset.playing="false";observer?.disconnect();document.removeEventListener('visibilitychange',sync);delete svg.gatewayStory;},
    timing:Object.freeze({contact,shoot,retractEnd,period,introEnd,initialPhase,zoomStart})
  };
  svg.gatewayStory=controller;
  sync();
  return controller;
}
