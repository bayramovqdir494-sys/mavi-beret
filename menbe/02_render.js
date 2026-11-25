// ===== renderer: WebGL2, shadow map, procedural materials, quad batches =====
const VS_MAIN = `#version 300 es
layout(location=0) in vec3 aP; layout(location=1) in vec3 aN; layout(location=2) in vec3 aC; layout(location=3) in float aM;
uniform mat4 uM,uVP,uLVP;
out vec3 vW; out vec3 vN; out vec3 vC; out vec3 vL; flat out float vM;
void main(){ vec4 w=uM*vec4(aP,1.); vW=w.xyz; vN=mat3(uM)*aN; vC=aC; vM=aM; vec4 l=uLVP*w; vL=l.xyz*.5+.5; gl_Position=uVP*w; }`;
const FS_MAIN = `#version 300 es
precision highp float; precision highp sampler2DShadow;
in vec3 vW; in vec3 vN; in vec3 vC; in vec3 vL; flat in float vM;
uniform sampler2DShadow uSh;
uniform vec3 uSun,uSunC,uSky,uGnd,uFogC,uCam;
uniform vec4 uFog; uniform vec4 uTint; uniform float uRim;
uniform vec4 uPL[4]; uniform vec3 uPLC[4];
uniform vec4 uGr; uniform vec3 uGt;
out vec4 o;
vec3 grade(vec3 c){ c*=uGr.z; float l=dot(c,vec3(.299,.587,.114)); c=mix(vec3(l),c,uGr.x); c=(c-.5)*uGr.y+.5; return max(c*uGt,0.); }
float h2(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float shadow(){
  vec2 e=abs(vL.xy-.5); float fade=smoothstep(.44,.5,max(e.x,e.y));
  float t=uFog.z, z=vL.z-.0005, s=0.;
  s+=texture(uSh,vec3(vL.xy+vec2(-1.4,-.5)*t,z)); s+=texture(uSh,vec3(vL.xy+vec2(.5,-1.4)*t,z));
  s+=texture(uSh,vec3(vL.xy+vec2(1.4,.5)*t,z)); s+=texture(uSh,vec3(vL.xy+vec2(-.5,1.4)*t,z));
  return mix(s*.25,1.,fade);
}
void main(){
  vec3 N=normalize(vN); int mi=int(vM+.5); vec3 c=vC;
  if(mi==9){ o=vec4(c,1.); return; }
  bool top=abs(N.y)>.7;
  float u=top?vW.z:(abs(N.x)>abs(N.z)?vW.z:vW.x);
  float y=top?vW.x:vW.y;
  float fw=fwidth(vW.x)+fwidth(vW.z)+fwidth(vW.y);   // pixel footprint in metres
  float dt=clamp(1.-fw*9.,0.,1.);                      // fine-detail fade
  if(mi==1){
    vec2 t=vW.xz/3.; vec2 f=fract(t); float e=min(min(f.x,1.-f.x),min(f.y,1.-f.y))*3.;
    float seam=mix(1.,smoothstep(.004,.022+fw*.8,e),clamp(1.-fw*1.4,0.,1.));
    c*=(1.+h2(floor(t))*.07-.035+vn(vW.xz*2.1)*.06*dt+vn(vW.xz*.27)*.08-.07)*mix(.8,1.,seam);
  }else if(mi==2||mi==10){
    float ph=mi==2?.62:.21, pl=mi==2?2.44:1.3;
    float fy=fwidth(y), fu=fwidth(u);
    float row=floor(y/ph), ry=fract(y/ph);
    float uo=u+h2(vec2(row,3.))*pl; float cu=floor(uo/pl), ru=fract(uo/pl);
    float kH=clamp(1.-fy/ph*2.2,0.,1.), kV=clamp(1.-fu/pl*2.2,0.,1.);
    float sH=mix(1.,smoothstep(0.,.02+fy,min(ry,1.-ry)*ph),kH), sV=mix(1.,smoothstep(0.,.014+fu,min(ru,1.-ru)*pl),kV);
    float pv=(h2(vec2(row,cu))*.15-.075)*kH;
    float gk=clamp(1.-fy*34.*.9,0.,1.);
    float gr=(vn(vec2(u*1.1+row*7.,y*34.))*.12-.06)*gk;
    float kn=smoothstep(.8,.95,vn(vec2(u*2.1+row*3.,y*9.)))*.14*clamp(1.-fy*9.,0.,1.);
    c*=(1.+pv+gr-kn)*mix(.6,1.,sH*sV);
  }else if(mi==3){
    c*=.92+vn(vW.xz*9.)*.08*dt+vn(vW.xz*.4)*.12-.04+h2(floor(vW.xz*36.))*.035*clamp(1.-fw*30.,0.,1.);
  }else if(mi==4){
    c*=.8+vn(vW.xz*.55)*.32+vn(vW.xz*6.)*.1*dt; c=mix(c,c*vec3(1.16,1.06,.74),vn(vW.xz*.19+7.)*.8);
  }else if(mi==5){
    c*=.84+vn(vW.xz*1.3)*.2+vn(vW.xz*7.)*.1*dt;
  }else if(mi==6){
    if(!top) c*=.9+.1*sin(u*26.)*clamp(1.-fwidth(u)*9.,0.,1.);
    c*=.93+vn(vec2(u*2.5,y*.9))*.14;
  }else if(mi==7){
    float ru=fract(u/2.5);
    c*=(.92+vn(vec2(u,y)*2.5)*.1*dt+vn(vec2(u,y)*.4)*.07)*mix(.76,1.,mix(1.,smoothstep(0.,.03+fwidth(u),min(ru,1.-ru)*2.5),clamp(1.-fwidth(u)*.9,0.,1.)));
  }else if(mi==8){
    c*=.88+vn(vW.xz*13.+vW.y*9.)*.16*dt;
  }else if(mi==11){
    if(!top) c*=.9+.1*sin(u*14.)*clamp(1.-fwidth(u)*6.,0.,1.); else c*=.92+.08*sin(vW.x*9.+vW.z*3.);
    c*=.95+vn(vec2(u,y)*3.)*.08;
  }else if(mi==14){
    c*=.94+vn(vW.xz*1.7)*.06*dt+vn(vW.xz*.22)*.07-.03; if(!top) c*=.93+vn(vec2(u,y)*4.)*.07;
  }else if(mi==15){
    vec2 q=vec2(u,y); c*=.9+vn(q*1.4)*.12+vn(q*6.)*.06*dt+vn(q*.3+5.)*.08-.04;
    c*=mix(.95,1.03,smoothstep(.45,.55,vn(q*.7+11.)));
  }else if(mi==16){
    float r=sin(vW.x*1.9+vW.z*.8+vn(vW.xz*.25)*7.)*.5+.5;
    c*=.88+r*.07*dt+vn(vW.xz*.12)*.16+vn(vW.xz*2.6)*.06*dt; c=mix(c,c*vec3(1.08,.98,.86),vn(vW.xz*.07+3.)*.7);
  }
  if(!top&&(mi==2||mi==6||mi==7||mi==15)) c*=mix(.74,1.,smoothstep(0.,.6,vW.y));
  float sh=shadow();
  if(mi==13){
    float t=uFog.w; vec2 p=vW.xz;
    float w1=vn(p*.32+vec2(t*.22,t*.09)), w2=vn(p*1.25-vec2(t*.38,-t*.27)), w3=vn(p*4.+vec2(t*.8,t*.55));
    vec3 Nw=normalize(vec3((w1-.5)*.45+(w2-.5)*.3+(w3-.5)*.12*dt,1.,(w2-.5)*.35+(w3-.5)*.14*dt-(w1-.5)*.25));
    vec3 V=normalize(uCam-vW); float fr=pow(1.-max(dot(Nw,V),0.),4.);
    vec3 wc=mix(c*(.75+.5*w1),mix(uFogC,uSky*1.3,.45),.12+.7*fr);
    vec3 H=normalize(uSun+V); float hs=max(dot(Nw,H),0.);
    vec3 col=wc*(.6+.4*sh)+uSunC*(pow(hs,260.)*3.5+pow(hs,28.)*.22)*sh;
    float fd=length(uCam-vW); float f=clamp((fd-uFog.x)/(uFog.y-uFog.x),0.,1.); col=mix(col,uFogC,f*f);
    o=vec4(grade(col),1.); return;
  }
  float ndl=dot(N,uSun);
  float lit=smoothstep(0.,.5,ndl)*sh;
  vec3 amb=mix(uGnd,uSky,N.y*.5+.5);
  vec3 col=c*(amb+uSunC*lit);
  vec3 V=normalize(uCam-vW);
  if(uRim>0.){ float r=1.-max(dot(N,V),0.); col+=uSky*r*r*r*uRim; }
  if(mi==12){ vec3 H=normalize(uSun+V); col+=uSunC*pow(max(dot(N,H),0.),40.)*.55*sh; }
  if(mi==14&&top){ float sp=step(.988,h2(floor(vW.xz*34.)))*dt; vec3 H=normalize(uSun+V); col+=uSunC*sp*lit*1.4; }
  if(mi==11) col+=c*uSunC*max(-ndl,0.)*.25;
  for(int i=0;i<4;i++){ vec3 d=uPL[i].xyz-vW; float a=max(0.,1.-dot(d,d)/uPL[i].w); col+=c*uPLC[i]*a*a*(.35+.65*max(dot(N,normalize(d)),0.)); }
  float fd=length(uCam-vW); float f=clamp((fd-uFog.x)/(uFog.y-uFog.x),0.,1.); col=mix(col,uFogC,f*f);
  col=mix(grade(col),uTint.rgb,uTint.a);
  o=vec4(col,1.);
}`;
const VS_SKY = `#version 300 es
out vec2 vN; void main(){ vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2))*2.-1.; vN=p; gl_Position=vec4(p,1.,1.); }`;
const FS_SKY = `#version 300 es
precision highp float; in vec2 vN; uniform mat4 uIVP; uniform vec3 uCam,uSun,uFogC,uZen,uMid,uSG,uCC; uniform float uT,uCl; uniform vec4 uGr; uniform vec3 uGt; out vec4 o;
vec3 grade(vec3 c){ c*=uGr.z; float l=dot(c,vec3(.299,.587,.114)); c=mix(vec3(l),c,uGr.x); c=(c-.5)*uGr.y+.5; return max(c*uGt,0.); }
float h2(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=vn(p)*a;p=p*2.03+17.1;a*=.5;}return s;}
void main(){
  vec4 a=uIVP*vec4(vN,1.,1.); vec3 d=normalize(a.xyz/a.w-uCam); float h=d.y;
  vec3 c=mix(uFogC,uMid,smoothstep(0.,.16,h)); c=mix(c,uZen,smoothstep(.16,.7,h));
  float sd=max(dot(d,uSun),0.); c+=uSG*(pow(sd,900.)*2.+pow(sd,24.)*.18+pow(sd,4.)*.08);
  if(h>0.){ vec2 uv=d.xz/(h+.1)*.9+vec2(uT*.006,uT*.002); float n=fbm(uv); float cl=smoothstep(.62-uCl*.2,.86-uCl*.12,n)*smoothstep(0.,.18,h);
    vec3 cc=mix(uCC*.84,uCC,smoothstep(.55,.95,n))+uSG*pow(sd,6.)*.35; c=mix(c,cc,cl*.88); }
  c=mix(c,uFogC,smoothstep(.06,0.,h)*.85);
  o=vec4(grade(c),1.); }`;
const VS_DEPTH = `#version 300 es
layout(location=0) in vec3 aP; uniform mat4 uM,uVP; void main(){ gl_Position=uVP*uM*vec4(aP,1.); }`;
const FS_DEPTH = `#version 300 es
precision mediump float; uniform vec4 uCol; out vec4 o; void main(){ o=uCol; }`;
const VS_QUAD = `#version 300 es
layout(location=0) in vec3 aP; layout(location=1) in vec2 aU; layout(location=2) in vec4 aC; layout(location=3) in float aS;
uniform mat4 uVP; out vec2 vU; out vec4 vC; flat out float vS;
void main(){ vU=aU; vC=aC; vS=aS; gl_Position=uVP*vec4(aP,1.); }`;
const FS_QUAD = `#version 300 es
precision mediump float; in vec2 vU; in vec4 vC; flat in float vS; out vec4 o;
void main(){ float d=length(vU), a;
  if(vS<.5){ a=clamp(1.-d,0.,1.); a*=a; }
  else if(vS<1.5) a=smoothstep(1.,.93,d)*smoothstep(.74,.82,d);
  else if(vS<2.5) a=smoothstep(1.,.9,d);
  else if(vS<3.5) a=smoothstep(1.,.55,abs(vU.x))*smoothstep(1.,.85,abs(vU.y));
  else a=smoothstep(1.,.96,d)*smoothstep(.9,.95,d);
  if(a*vC.a<.004) discard;
  o=vec4(vC.rgb,vC.a*a); }`;

const R = { MAXI: 3072, ni: 0, CAST: 1, SIL: 2, RIM: 4, shQ: 2048, scale: 1 };
R.init = function (cv) {
  const gl = cv.getContext('webgl2', { antialias: true, stencil: true, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return false;
  R.gl = gl; R.cv = cv;
  R.mats = new Float32Array(R.MAXI * 16); R.views = []; for (let i = 0; i < R.MAXI; i++) R.views.push(R.mats.subarray(i * 16, i * 16 + 16));
  R.im = new Array(R.MAXI); R.ifl = new Uint8Array(R.MAXI); R.itint = new Float32Array(R.MAXI * 4);
  const prog = (vs, fs, names) => {
    const p = gl.createProgram();
    for (const [t, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
      const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(s));
      gl.attachShader(p, s);
    }
    gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
    const u = { p }; for (const n of names) u[n] = gl.getUniformLocation(p, n); return u;
  };
  R.pm = prog(VS_MAIN, FS_MAIN, ['uM', 'uVP', 'uLVP', 'uSh', 'uSun', 'uSunC', 'uSky', 'uGnd', 'uFogC', 'uCam', 'uFog', 'uTint', 'uRim', 'uPL', 'uPLC', 'uGr', 'uGt']);
  R.pd = prog(VS_DEPTH, FS_DEPTH, ['uM', 'uVP', 'uCol']);
  R.pq = prog(VS_QUAD, FS_QUAD, ['uVP']);
  R.psk = prog(VS_SKY, FS_SKY, ['uIVP', 'uCam', 'uSun', 'uFogC', 'uT', 'uZen', 'uMid', 'uSG', 'uCC', 'uCl', 'uGr', 'uGt']); R.skyVao = gl.createVertexArray();
  R.lv = m4(); R.lp = m4(); R.lvp = m4(); R.idm = m4();
  R.pl = new Float32Array(16); R.plc = new Float32Array(12);
  R.makeShadow(R.shQ);
  // quad batches
  const MQ = Q.MAX, idx = new Uint16Array(MQ * 6);
  for (let i = 0; i < MQ; i++) { const b = i * 4, o = i * 6; idx[o] = b; idx[o + 1] = b + 1; idx[o + 2] = b + 2; idx[o + 3] = b; idx[o + 4] = b + 2; idx[o + 5] = b + 3; }
  for (const B of [Q.A, Q.B, Q.D]) {
    B.d = new Float32Array(MQ * 40); B.n = 0;
    B.vao = gl.createVertexArray(); gl.bindVertexArray(B.vao);
    B.vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, B.vb); gl.bufferData(gl.ARRAY_BUFFER, B.d.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 40, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 40, 12);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 40, 20);
    gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 40, 36);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  }
  gl.bindVertexArray(null);
  return true;
};
R.makeShadow = function (size) {
  const gl = R.gl; if (R.shTex) { gl.deleteTexture(R.shTex); gl.deleteFramebuffer(R.shFbo); }
  R.shQ = size; const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, size, size, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
  const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, t, 0);
  gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); R.shTex = t; R.shFbo = f;
};
R.mesh = function (g) {
  const gl = R.gl, vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g.v), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 40, 0);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 40, 12);
  gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 40, 24);
  gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 40, 36);
  const big = g.n > 65535, ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, big ? new Uint32Array(g.i) : new Uint16Array(g.i), gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  return { vao, vb, ib, n: g.i.length, t: big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT };
};
R.free = function (m) { if (!m) return; const gl = R.gl; gl.deleteVertexArray(m.vao); if (m.vb) gl.deleteBuffer(m.vb); if (m.ib) gl.deleteBuffer(m.ib); };
R.begin = function () { R.ni = 0; Q.A.n = Q.B.n = Q.D.n = 0; };
// queue a mesh; returns the matrix view to fill in
R.add = function (mesh, flags, tr, tg, tb, ta) {
  const i = R.ni < R.MAXI ? R.ni++ : R.MAXI - 1; R.im[i] = mesh; R.ifl[i] = flags;
  const o = i * 4; R.itint[o] = tr || 0; R.itint[o + 1] = tg || 0; R.itint[o + 2] = tb || 0; R.itint[o + 3] = ta || 0;
  return R.views[i];
};
R.resize = function () {
  const cv = R.cv, dpr = min(window.devicePixelRatio || 1, 2) * R.scale;
  const w = max(2, Math.round(cv.clientWidth * dpr)), h = max(2, Math.round(cv.clientHeight * dpr));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
};
R.frame = function (S) {
  const gl = R.gl, n = R.ni, im = R.im, fl = R.ifl, vw = R.views;
  // --- light matrices (texel-snapped ortho) ---
  const RAD = S.shR || 30, sx = S.sun[0], sy = S.sun[1], sz = S.sun[2];
  m4look(R.lv, S.focus[0] + sx * 70, sy * 70, S.focus[1] + sz * 70, S.focus[0], 0, S.focus[1], 0, 1, 0);
  const tex = 2 * RAD / R.shQ; R.lv[12] = Math.round(R.lv[12] / tex) * tex; R.lv[13] = Math.round(R.lv[13] / tex) * tex;
  m4ortho(R.lp, -RAD, RAD, -RAD, RAD, 1, 150); m4mul(R.lvp, R.lp, R.lv);
  // --- shadow pass ---
  gl.bindFramebuffer(gl.FRAMEBUFFER, R.shFbo); gl.viewport(0, 0, R.shQ, R.shQ);
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LESS); gl.depthMask(true); gl.disable(gl.BLEND); gl.disable(gl.STENCIL_TEST);
  gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE); gl.cullFace(gl.FRONT);
  gl.useProgram(R.pd.p); gl.uniformMatrix4fv(R.pd.uVP, false, R.lvp);
  gl.uniformMatrix4fv(R.pd.uM, false, R.idm);
  for (const m of S.statics) { gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES, m.n, m.t, 0); }
  let last = null;
  for (let i = 0; i < n; i++) {
    if (!(fl[i] & 1)) continue; const m = im[i];
    if (m !== last) { gl.bindVertexArray(m.vao); last = m; }
    gl.uniformMatrix4fv(R.pd.uM, false, vw[i]); gl.drawElements(gl.TRIANGLES, m.n, m.t, 0);
  }
  gl.cullFace(gl.BACK);
  // --- main pass ---
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, R.cv.width, R.cv.height);
  gl.clearColor(S.fogC[0], S.fogC[1], S.fogC[2], 1); gl.clearStencil(0); gl.stencilMask(0xff);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  const P = R.pm; gl.useProgram(P.p);
  gl.uniformMatrix4fv(P.uVP, false, S.vp); gl.uniformMatrix4fv(P.uLVP, false, R.lvp);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, R.shTex); gl.uniform1i(P.uSh, 0);
  gl.uniform3fv(P.uSun, S.sun); gl.uniform3fv(P.uSunC, S.sunC); gl.uniform3fv(P.uSky, S.sky); gl.uniform3fv(P.uGnd, S.gnd);
  gl.uniform3fv(P.uFogC, S.fogC); gl.uniform3fv(P.uCam, S.cam); gl.uniform4f(P.uFog, S.fog[0], S.fog[1], 1 / R.shQ, S.time || 0);
  const pl = R.pl, plc = R.plc; pl.fill(0); plc.fill(0);
  for (let i = 0; i < 4; i++) {
    const L = S.lights[i]; if (L) { pl[i * 4] = L.x; pl[i * 4 + 1] = L.y; pl[i * 4 + 2] = L.z; pl[i * 4 + 3] = L.r * L.r; plc[i * 3] = L.c[0] * L.k; plc[i * 3 + 1] = L.c[1] * L.k; plc[i * 3 + 2] = L.c[2] * L.k; } else pl[i * 4 + 3] = 1;
  }
  gl.uniform4fv(P.uPL, pl); gl.uniform3fv(P.uPLC, plc);
  gl.uniform4f(P.uTint, 0, 0, 0, 0); gl.uniform1f(P.uRim, 0); gl.uniform4fv(P.uGr, S.gr); gl.uniform3fv(P.uGt, S.gt);
  gl.uniformMatrix4fv(P.uM, false, R.idm);
  for (const m of S.statics) { gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES, m.n, m.t, 0); }
  last = null; let lr = 0, lt = 0, ls = 0; const tn = R.itint;
  gl.stencilFunc(gl.ALWAYS, 1, 0xff); gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
  for (let i = 0; i < n; i++) {
    const m = im[i], f = fl[i];
    if (m !== last) { gl.bindVertexArray(m.vao); last = m; }
    const rim = f & 4 ? 0.55 : 0; if (rim !== lr) { gl.uniform1f(P.uRim, rim); lr = rim; }
    const ta = tn[i * 4 + 3]; if (ta !== lt || ta > 0) { gl.uniform4f(P.uTint, tn[i * 4], tn[i * 4 + 1], tn[i * 4 + 2], ta); lt = ta; }
    const s = f & 2; if (s !== ls) { if (s) gl.enable(gl.STENCIL_TEST); else gl.disable(gl.STENCIL_TEST); ls = s; }
    gl.uniformMatrix4fv(P.uM, false, vw[i]); gl.drawElements(gl.TRIANGLES, m.n, m.t, 0);
  }
  // --- sky (only where nothing was drawn) ---
  gl.useProgram(R.psk.p); gl.uniformMatrix4fv(R.psk.uIVP, false, S.ivp); gl.uniform3fv(R.psk.uCam, S.cam); gl.uniform3fv(R.psk.uSun, S.sun); gl.uniform3fv(R.psk.uFogC, S.fogC); gl.uniform1f(R.psk.uT, S.time || 0); gl.uniform3fv(R.psk.uZen, S.zen); gl.uniform3fv(R.psk.uMid, S.mid); gl.uniform3fv(R.psk.uSG, S.sunG); gl.uniform3fv(R.psk.uCC, S.cloudC); gl.uniform1f(R.psk.uCl, S.cloud); gl.uniform4fv(R.psk.uGr, S.gr); gl.uniform3fv(R.psk.uGt, S.gt);
  gl.disable(gl.STENCIL_TEST); ls = 0; gl.depthFunc(gl.LEQUAL); gl.depthMask(false); gl.bindVertexArray(R.skyVao); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.depthMask(true); gl.depthFunc(gl.LESS);
  // --- silhouettes of occluded friendlies ---
  gl.useProgram(R.pd.p); gl.uniformMatrix4fv(R.pd.uVP, false, S.vp); gl.uniform4f(R.pd.uCol, 0.35, 0.62, 1.0, 0.42);
  gl.enable(gl.STENCIL_TEST); gl.stencilFunc(gl.EQUAL, 0, 0xff); gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
  gl.depthFunc(gl.GREATER); gl.depthMask(false); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  last = null;
  for (let i = 0; i < n; i++) {
    if (!(fl[i] & 2)) continue; const m = im[i];
    if (m !== last) { gl.bindVertexArray(m.vao); last = m; }
    gl.uniformMatrix4fv(R.pd.uM, false, vw[i]); gl.drawElements(gl.TRIANGLES, m.n, m.t, 0);
  }
  gl.disable(gl.STENCIL_TEST); gl.depthFunc(gl.LEQUAL);
  // --- quads: decals, alpha, additive ---
  gl.useProgram(R.pq.p); gl.uniformMatrix4fv(R.pq.uVP, false, S.vp); gl.disable(gl.CULL_FACE);
  const drawB = B => { if (!B.n) return; gl.bindVertexArray(B.vao); gl.bindBuffer(gl.ARRAY_BUFFER, B.vb); gl.bufferSubData(gl.ARRAY_BUFFER, 0, B.d, 0, B.n * 40); gl.drawElements(gl.TRIANGLES, B.n * 6, gl.UNSIGNED_SHORT, 0); };
  gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-2, -4); drawB(Q.D); gl.disable(gl.POLYGON_OFFSET_FILL);
  drawB(Q.A);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE); drawB(Q.B);
  gl.disable(gl.BLEND); gl.depthMask(true); gl.depthFunc(gl.LESS); gl.enable(gl.CULL_FACE); gl.bindVertexArray(null);
};

// ---- quad batches: D = decals (alpha, polygon offset), A = alpha, B = additive ----
const Q = { MAX: 2600, A: {}, B: {}, D: {}, rx: 1, ry: 0, rz: 0, ux: 0, uy: 1, uz: 0, cx: 0, cy: 0, cz: 0 };
Q.cam = function (view, cam) { Q.rx = view[0]; Q.ry = view[4]; Q.rz = view[8]; Q.ux = view[1]; Q.uy = view[5]; Q.uz = view[9]; Q.cx = cam[0]; Q.cy = cam[1]; Q.cz = cam[2]; };
Q._q = function (B, x, y, z, ax, ay, az, bx, by, bz, r, g, b, a, s) {
  if (B.n >= Q.MAX) return; const d = B.d; let o = B.n++ * 40;
  d[o] = x - ax - bx; d[o + 1] = y - ay - by; d[o + 2] = z - az - bz; d[o + 3] = -1; d[o + 4] = -1; d[o + 5] = r; d[o + 6] = g; d[o + 7] = b; d[o + 8] = a; d[o + 9] = s; o += 10;
  d[o] = x + ax - bx; d[o + 1] = y + ay - by; d[o + 2] = z + az - bz; d[o + 3] = 1; d[o + 4] = -1; d[o + 5] = r; d[o + 6] = g; d[o + 7] = b; d[o + 8] = a; d[o + 9] = s; o += 10;
  d[o] = x + ax + bx; d[o + 1] = y + ay + by; d[o + 2] = z + az + bz; d[o + 3] = 1; d[o + 4] = 1; d[o + 5] = r; d[o + 6] = g; d[o + 7] = b; d[o + 8] = a; d[o + 9] = s; o += 10;
  d[o] = x - ax + bx; d[o + 1] = y - ay + by; d[o + 2] = z - az + bz; d[o + 3] = -1; d[o + 4] = 1; d[o + 5] = r; d[o + 6] = g; d[o + 7] = b; d[o + 8] = a; d[o + 9] = s;
};
Q.bill = function (B, x, y, z, s, r, g, b, a, sh) { Q._q(B, x, y, z, Q.rx * s, Q.ry * s, Q.rz * s, Q.ux * s, Q.uy * s, Q.uz * s, r, g, b, a, sh || 0); };
Q.flat = function (B, x, y, z, sx, sz, yaw, r, g, b, a, sh) { const c = cos(yaw), s = sin(yaw); Q._q(B, x, y, z, c * sx, 0, -s * sx, s * sz, 0, c * sz, r, g, b, a, sh || 0); };
Q.line = function (B, ax, ay, az, bx, by, bz, w, r, g, b, a, sh) {
  const mx = (ax + bx) / 2, my = (ay + by) / 2, mz = (az + bz) / 2, dx = (bx - ax) / 2, dy = (by - ay) / 2, dz = (bz - az) / 2;
  const vx = Q.cx - mx, vy = Q.cy - my, vz = Q.cz - mz; let sx = dy * vz - dz * vy, sy = dz * vx - dx * vz, sz = dx * vy - dy * vx; const l = w / (hyp(sx, sy, sz) || 1);
  Q._q(B, mx, my, mz, dx, dy, dz, sx * l, sy * l, sz * l, r, g, b, a, sh === undefined ? 3 : sh);
};
Q.wall = function (B, x, y, z, nx, ny, nz, s, r, g, b, a, sh) {
  let ux, uy, uz; if (abs(ny) > 0.9) { ux = 1; uy = 0; uz = 0; } else { const l = 1 / hyp(nz, nx); ux = nz * l; uy = 0; uz = -nx * l; }
  const vx = ny * uz - nz * uy, vy = nz * ux - nx * uz, vz = nx * uy - ny * ux;
  Q._q(B, x + nx * 0.012, y + ny * 0.012, z + nz * 0.012, ux * s, uy * s, uz * s, vx * s, vy * s, vz * s, r, g, b, a, sh || 0);
};
