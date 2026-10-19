(function(){var app=document.getElementById("app"),body=document.body;if(!app)return;
var g=document.getElementById("petals");
if(g&&!g.children.length){var h="",i;for(i=0;i<12;i++){var m=i%2;h+='<ellipse cy="-50" rx="13" ry="27" transform="rotate('+i*30+')" fill="'+(m?'#ff2e8833':'#19f3e633')+'" stroke="'+(m?'#ff2e88':'#19f3e6')+'"/>'}for(i=0;i<24;i++){h+='<circle cy="-85" r="3" transform="rotate('+i*15+')" fill="#ffc857"/>'}g.innerHTML=h}
var rw=app.querySelector(".rw"),src=null,pcs=[],crk=null,tk=0,pi=null,lastP=-1,isB=false;
if(rw){src=rw.querySelector("svg.rose");if(src)src=src.cloneNode(true);rw.innerHTML=""}
else{src=app.querySelector("svg.rose");if(src){rw=document.createElement("div");src.parentNode.insertBefore(rw,src);src.remove()}}
if(rw&&src){
 src.setAttribute("class","rose");src.removeAttribute("style");src.querySelectorAll(".spin").forEach(function(g){g.removeAttribute("style")});rw.className="rw";
 var mk=function(){var dv=document.createElement("div");dv.className="pc";var s=src.cloneNode(true),pe=s.querySelector("#petals");if(pe)pe.removeAttribute("id");dv.appendChild(s);rw.appendChild(dv);return dv};
 pi=mk();
 var S=innerWidth<700?7:9,RD=[0,.33,.68,1.35],V=[],seed=7,k,j,a,rd,j2,d="";
 var rnd=function(){seed=seed*16807%2147483647;return seed/2147483647};
 for(k=0;k<4;k++){V[k]=[];for(j=0;j<S;j++){a=(j+(k?rnd()*.5-.25:0))/S*6.2832-1.5708;rd=RD[k]*(k&&k<3?.9+rnd()*.2:1);V[k][j]=[50+50*rd*Math.cos(a),50+50*rd*Math.sin(a)]}}
 var polys=[V[1]];
 for(k=1;k<3;k++)for(j=0;j<S;j++){j2=(j+1)%S;polys.push([V[k][j],V[k][j2],V[k+1][j2],V[k+1][j]])}
 polys.forEach(function(pl,n){var cx=0,cy=0;pl.forEach(function(v){cx+=v[0];cy+=v[1]});cx=cx/pl.length-50;cy=cy/pl.length-50;var L=Math.hypot(cx,cy)||1;
  var el=mk(),cp="polygon("+pl.map(function(v){return v[0].toFixed(1)+"% "+v[1].toFixed(1)+"%"}).join(",")+")";
  el.style.clipPath=el.style.webkitClipPath=cp;el.style.transformOrigin=(cx+50).toFixed(1)+"% "+(cy+50).toFixed(1)+"%";el.style.visibility="hidden";
  var f=.4+rnd()*.5;pcs.push({el:el,ux:n?cx/L*f:0,uy:n?cy/L*f:0,gy:.15+rnd()*.5,rot:(rnd()-.5)*(n?220:40)})});
 function q(v){return v[0].toFixed(1)+" "+v[1].toFixed(1)}
 for(j=0;j<S;j++){d+="M50 50L"+q(V[1][j]);d+="M"+q(V[1][j])+"L"+q(V[2][j]);d+="M"+q(V[2][j])+"L"+(50+(V[3][j][0]-50)*.71).toFixed(1)+" "+(50+(V[3][j][1]-50)*.71).toFixed(1);for(k=1;k<3;k++)d+="M"+q(V[k][j])+"L"+q(V[k][(j+1)%S])}
 var ns="http://www.w3.org/2000/svg",pa=document.createElementNS(ns,"path");crk=document.createElementNS(ns,"svg");crk.setAttribute("viewBox","0 0 100 100");crk.setAttribute("class","crk");pa.setAttribute("d",d);crk.appendChild(pa);rw.appendChild(crk)}
function upd(){if(!rw||!pi)return;var p=Math.min(1,Math.max(0,(window.pageYOffset||document.documentElement.scrollTop||0)/(innerHeight*.7)));if(body.classList.contains("calm"))p=0;if(p===lastP)return;lastP=p;
 var br=p>.01;
 if(br!==isB){isB=br;rw.classList.toggle("broken",br);
  if(br){var ang=0;try{var mx=new DOMMatrix(getComputedStyle(pi.querySelector(".spin")).transform);ang=Math.atan2(mx.b,mx.a)*180/Math.PI}catch(x){}
   pcs.forEach(function(c){var g=c.el.querySelector(".spin");g.style.animation="none";g.style.transform="rotate("+ang+"deg)";c.el.style.visibility="visible"});pi.style.visibility="hidden"}
  else{pcs.forEach(function(c){c.el.style.visibility="hidden"});pi.style.visibility="visible"}}
 var e=Math.max(0,(p-.05)/.95),W=Math.min(innerWidth,980)*.6,H=innerHeight*.6;
 pcs.forEach(function(c){c.el.style.transform="translate3d("+c.ux*W*e+"px,"+(c.uy*W*e+c.gy*H*e*e)+"px,0) rotate("+c.rot*e+"deg)";c.el.style.opacity=1-Math.max(0,(e-.5)/.5)});
 if(crk)crk.style.opacity=Math.min(1,p/.05)*(1-Math.min(1,e/.2))}



 
 
window.addEventListener("scroll",function(){if(!tk){tk=1;requestAnimationFrame(function(){tk=0;upd()})}},{passive:true});
window.addEventListener("resize",upd);document.getElementById("fx").addEventListener("click",function(){setTimeout(upd,0)});upd();
var glt=document.getElementById("glt"),busy=0;
document.addEventListener("click",function(ev){var a=ev.target.closest("nav a");if(!a)return;if(a.id==="arch"){ev.preventDefault();openSec();return}var id=a.getAttribute("href");if(!id||id.charAt(0)!=="#")return;var t=document.querySelector(id);if(!t)return;ev.preventDefault();if(busy)return;
 var go=function(){t.scrollIntoView({behavior:"smooth",block:"start"})};
 if(body.classList.contains("calm")){go();return}
 busy=1;glt.classList.remove("on");void glt.offsetWidth;glt.classList.add("on");body.classList.add("glitching");
 setTimeout(go,350);setTimeout(function(){glt.classList.remove("on");body.classList.remove("glitching");busy=0},780)});
var SEC=window.CP_SEC,sec=document.getElementById("sec"),st=0,cnt=0,tm;
function fxG(cb){if(busy||body.classList.contains("calm")){cb();return}busy=1;glt.classList.remove("on");void glt.offsetWidth;glt.classList.add("on");body.classList.add("glitching");setTimeout(cb,350);setTimeout(function(){glt.classList.remove("on");body.classList.remove("glitching");busy=0},780)}
function showLink(){if(document.getElementById("arch"))return;var a=document.createElement("a");a.id="arch";a.href="#archangel";a.textContent=CS_I18N.t("arch");a.setAttribute("data-i18n","arch");app.querySelector("nav").appendChild(a)}
function rst(){st=0;cnt=0}
document.addEventListener("click",function(ev){if(document.getElementById("arch"))return;var t=ev.target;
 var ro=t.closest&&t.closest(".rw"),nm=t.closest&&t.closest("h1");clearTimeout(tm);tm=setTimeout(rst,6000);
 if(ro){st=1;cnt=0;return}
 if(st&&nm){if(++cnt>=4){rst();fxG(showLink)}return}
 rst()});
function openSec(){fxG(function(){sec.hidden=false;body.classList.add("lock");sec.scrollTop=0;document.getElementById("pw").focus()})}
function closeSec(){fxG(function(){sec.hidden=true;body.classList.remove("lock");document.getElementById("vault").innerHTML="";document.getElementById("gate").hidden=false;document.getElementById("pw").value="";document.getElementById("msg").textContent=""})}
function b64(x){return Uint8Array.from(atob(x),function(c){return c.charCodeAt(0)})}
async function dec(p){var k0=await crypto.subtle.importKey("raw",new TextEncoder().encode(p.toLowerCase().split(/\s+/).filter(Boolean).join(" ")),"PBKDF2",false,["deriveKey"]);
 var k=await crypto.subtle.deriveKey({name:"PBKDF2",salt:b64(SEC.s),iterations:200000,hash:"SHA-256"},k0,{name:"AES-GCM",length:256},false,["decrypt"]);
 return new TextDecoder().decode(await crypto.subtle.decrypt({name:"AES-GCM",iv:b64(SEC.i)},k,b64(SEC.c)))}
async function tryPw(){var m=document.getElementById("msg");m.textContent="";var out;
 try{out=await dec(document.getElementById("pw").value)}catch(e){m.textContent=CS_I18N.t((window.crypto&&crypto.subtle)?"wrong":"nosecure");return}
 fxG(function(){document.getElementById("gate").hidden=true;document.getElementById("vault").innerHTML=out;sec.scrollTop=0})}
document.getElementById("go").onclick=tryPw;document.getElementById("sx").onclick=closeSec;
document.getElementById("pw").addEventListener("keydown",function(e){if(e.key==="Enter")tryPw()});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!sec.hidden)closeSec()});
function setMotion(c){var b=document.getElementById("fx"),k=c?"motion_off":"motion_on";body.classList.toggle("calm",c);b.setAttribute("data-i18n",k);b.textContent=CS_I18N.t(k)}
document.getElementById("fx").onclick=function(){setMotion(!body.classList.contains("calm"))};
if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)setMotion(true);
{body.classList.add("js");
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12});
 app.querySelectorAll("section").forEach(function(s){io.observe(s)});
 var r=app.querySelector(".role");
 if(r){var t=r.textContent,n=0;r.textContent="";r.classList.add("typing");var iv=setInterval(function(){r.textContent=t.slice(0,++n);if(n>=t.length){clearInterval(iv);r.classList.remove("typing")}},80);
 window.csTypingStop=function(){clearInterval(iv);r.classList.remove("typing")}}}
window.csGlitch=fxG;

})();
