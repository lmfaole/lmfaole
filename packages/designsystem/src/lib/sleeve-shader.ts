import type { Light } from "./light"
import { type Mat4, multiply, perspective, rotationPart, rotationX, rotationY, translation } from "./mat4"
import type { Rgb } from "./palette"

/**
 * An album's sleeve in 3D: a thin slab of plastic-wrapped cover with a record pulled half out of it, that tilts toward the page's light (`lib/light.ts`) and catches it. The cover is whole and upright on the
 * front face, under a shrink-wrap film whose streaks and glint move across it as the angle changes, creased near the edges and hazed at a glancing angle. The record is coloured vinyl in the cover's own
 * colour, with a pale label of it and two bands of reflected light in that colour; when it is first drawn it slides out of the sleeve (`out`, 0 inside, 1 half out) and turns a little as it rolls. A box, a quad, one texture: no library. Drawn when the light changes and at no other time, so nothing loops.
 * With `kind: "dvd"` it is a film's DVD case instead: black plastic, the poster under a clear sleeve inside its rim, and a silver disc with a hole and a clear hub whose tracks split the light into a spectrum.
 * With `kind: "cd"` it is an album's CD in its jewel case: the booklet's cover under a clear, glossy lid with the hinge's ridges on the left and the black tray's edge showing round it, and a CD whose
 * tracks are twice as far apart as a DVD's, so the light splits into more, narrower rainbows.
 * With `kind: "cartridge"` it is a handheld's game: the box picture under the clear sleeve of a slim black case, and a game card half out of it, dark plastic with the box picture on its glossy label.
 * The old consoles' games have their own (`GAME_CASES`): a cardboard box with the console's cartridge half out of it (`nes`, `snes`, `n64`, `gameboy`, `gba`), each in its own plastic, outline, label and
 * grip; a black clamshell with a black cartridge (`genesis`); and a jewel case with a black disc (`psx`, the first PlayStation's).
 */

/** A game's case for the old consoles as well as a handheld's: each holds its own cartridge (or the first PlayStation's black disc). */
export const GAME_CASES = ["cartridge", "nes", "snes", "n64", "gameboy", "gba", "genesis", "psx"] as const
export type GameCase = (typeof GAME_CASES)[number]

/** What is drawn: an album's sleeve with a record, a film's DVD case with a disc, an album's CD in its jewel case, or a game's case with what it holds. */
export type SleeveKind = "record" | "dvd" | "cd" | GameCase

/**
 * A cartridge, in its own units (its half height is 1): its half width and half height; its plastic; its label (left, bottom, right, top); a band of ridges to grip (bottom, top, half width; none where
 * it is 0); grooves down both sides (how far out, 0 for none); and its outline: the radius of its top corners and its bottom ones, the top right corner cut off and both top corners cut off (how much).
 */
interface Cart {
  size: readonly [number, number]
  body: readonly [number, number, number]
  label: readonly [number, number, number, number]
  grip: readonly [number, number, number]
  grooves: number
  outline: readonly [number, number, number, number]
  /** How thick it is, as a share of its height (a game card is thin, an NES cartridge a brick). */
  thick: number
}

/**
 * Each console's cartridge, from the real ones' proportions: a game card is 21 × 31 mm (a little wider for its label), the NES's grey 120 × 133 mm with its label at the top and ridges at the bottom, the
 * Super Nintendo's pale grey with round shoulders and grooves down its sides, the Nintendo 64's dark and wide with its shoulders cut, the Game Boy's grey with its corner cut and ridges along its top, the Game
 * Boy Advance's dark and wide with a round top, and the Mega Drive's black with its shoulders cut and a ridged grip.
 */
const CARTS: Readonly<Partial<Record<SleeveKind, Cart>>> = {
  cartridge: { size: [0.7, 1], body: [0.075, 0.075, 0.085], label: [-0.56, -0.84, 0.56, 0.56], grip: [0.68, 0.92, 0.5], grooves: 0, outline: [0.08, 0.08, 0.2, 0], thick: 0.1 },
  nes: { size: [0.9, 1], body: [0.46, 0.46, 0.47], label: [-0.74, -0.02, 0.74, 0.88], grip: [-0.92, -0.42, 0.78], grooves: 0, outline: [0.03, 0.03, 0, 0], thick: 0.15 },
  snes: { size: [1.08, 1], body: [0.6, 0.59, 0.58], label: [-0.7, -0.62, 0.7, 0.62], grip: [0, 0, 0], grooves: 0.9, outline: [0.34, 0.06, 0, 0], thick: 0.22 },
  n64: { size: [1.55, 1], body: [0.17, 0.17, 0.19], label: [-1.02, -0.78, 1.02, 0.6], grip: [0, 0, 0], grooves: 1.32, outline: [0.05, 0.08, 0, 0.42], thick: 0.24 },
  gameboy: { size: [0.88, 1], body: [0.55, 0.55, 0.57], label: [-0.7, -0.86, 0.7, 0.36], grip: [0.56, 0.9, 0.66], grooves: 0, outline: [0.04, 0.07, 0.24, 0], thick: 0.12 },
  gba: { size: [1.63, 1], body: [0.2, 0.2, 0.23], label: [-1.28, -0.22, 1.28, 0.82], grip: [-0.88, -0.46, 1.2], grooves: 0, outline: [0.38, 0.06, 0, 0], thick: 0.22 },
  genesis: { size: [0.82, 1], body: [0.05, 0.05, 0.055], label: [-0.64, -0.3, 0.64, 0.84], grip: [-0.92, -0.5, 0.66], grooves: 0, outline: [0.03, 0.05, 0, 0.26], thick: 0.18 },
}

/**
 * The shape of each kind, in a scene 1 high: the case's width and depth, the disc's radius (half of it out to the right), and the part of the case's face the picture fills (`inset`, the margin left, top,
 * right and bottom in texture coordinates). A record's sleeve is the square cover with a 12-inch record; a DVD case is 135 × 190 × 14 mm, the poster (2:3) under its clear sleeve inside a black rim, and the
 * disc 120 mm; a CD's jewel case is 142 × 125 × 10 mm, the booklet (120 mm square) right of the hinge, and the disc 120 mm. A game card's case is slim, its picture 2:3 under the sleeve, and the card
 * drawn larger than life (a real one is 21 × 31 mm) so its label reads: `disc` is half its height, and `reach` how far it comes out of the case (half its width), where a disc's is its radius.
 */
export const SLEEVE_SHAPES: Readonly<Record<SleeveKind, { width: number; depth: number; disc: number; reach: number; inset: [number, number, number, number]; aspect: number }>> = {
  record: { width: 1, depth: 0.07, disc: 0.46, reach: 0.46, inset: [0, 0, 0, 0], aspect: 1.46 },
  dvd: { width: 0.72, depth: 0.074, disc: 0.315, reach: 0.315, inset: [0.04 / 0.72, 0.02, 0.04 / 0.72, 0.02], aspect: 1.035 },
  cd: { width: 142 / 125, depth: 10 / 125, disc: 60 / 125, reach: 60 / 125, inset: [15 / 142, 2.5 / 125, 7 / 142, 2.5 / 125], aspect: 142 / 125 + 60 / 125 },
  cartridge: { width: 0.66, depth: 0.06, disc: 0.24, reach: 0.24 * 0.7, inset: [0.0135 / 0.66, 0.025, 0.0135 / 0.66, 0.025], aspect: 0.66 + 0.24 * 0.7 },
  // The cardboard boxes: the picture is the whole face, in the shape of that console's real box (the NES's 5:7, the Game Boy's nearly square, the GBA's square, the SNES's and the N64's lying down), and as deep as the real ones are for their height; the cartridge about the size it is beside its box.
  nes: { width: 5 / 7, depth: 0.16, disc: 0.36, reach: 0.36 * 0.9, inset: [0, 0, 0, 0], aspect: 5 / 7 + 0.36 * 0.9 },
  snes: { width: 1.38, depth: 0.2, disc: 0.42, reach: 0.42 * 1.08, inset: [0, 0, 0, 0], aspect: 1.38 + 0.42 * 1.08 },
  n64: { width: 1.38, depth: 0.2, disc: 0.32, reach: 0.32 * 1.55, inset: [0, 0, 0, 0], aspect: 1.38 + 0.32 * 1.55 },
  gameboy: { width: 0.92, depth: 0.14, disc: 0.36, reach: 0.36 * 0.88, inset: [0, 0, 0, 0], aspect: 0.92 + 0.36 * 0.88 },
  gba: { width: 1, depth: 0.14, disc: 0.24, reach: 0.24 * 1.63, inset: [0, 0, 0, 0], aspect: 1 + 0.24 * 1.63 },
  genesis: { width: 0.72, depth: 0.1, disc: 0.34, reach: 0.34 * 0.82, inset: [0.04 / 0.72, 0.02, 0.04 / 0.72, 0.02], aspect: 0.72 + 0.34 * 0.82 },
  psx: { width: 142 / 125, depth: 10 / 125, disc: 60 / 125, reach: 60 / 125, inset: [15 / 142, 2.5 / 125, 7 / 142, 2.5 / 125], aspect: 142 / 125 + 60 / 125 },
}

/** The case's face: a record's card (0), black plastic (1), a jewel case (2) or a printed cardboard box (3). */
const MODES: Readonly<Record<SleeveKind, number>> = { record: 0, dvd: 1, cd: 2, cartridge: 1, nes: 3, snes: 3, n64: 3, gameboy: 3, gba: 3, genesis: 1, psx: 2 }

/** Whether the case's picture is a poster's (2:3) or a cover's (square, a jewel case's booklet). */
export const sleeveRatio = (kind: SleeveKind): "poster" | "square" => (kind === "record" || kind === "cd" || kind === "psx" ? "square" : "poster")

/**
 * Where the case's picture is drawn at rest, as a share of the drawing: left, top, width and height. The camera sees 2 × 3 × tan(11.25°) of the scene's height at the middle, and the face is a little nearer by half
 * the case's depth; the case is moved left by half the reach so it and what it holds are centred together. The picture alone stands there until WebGL takes over.
 */
export function sleeveFace(kind: SleeveKind): { left: number; top: number; width: number; height: number } {
  const shape = SLEEVE_SHAPES[kind]
  const seen = 6 * Math.tan((11.25 * Math.PI) / 180)
  const near = 3 / (3 - shape.depth / 2)
  const [left, top, right, bottom] = shape.inset
  const width = shape.width * (1 - left - right) * near
  const height = (1 - top - bottom) * near
  const centre = (-shape.reach / 2 + (shape.width * (left - right)) / 2) * near
  const across = shape.aspect * seen
  return { left: (centre - width / 2 + across / 2) / across, top: (seen / 2 - ((bottom - top) / 2) * near - height / 2) / seen, width: width / across, height: height / seen }
}

/** The scene is 1.46 wide and 1 high: a sleeve of 1 and a record of 0.92 with half of it out. */
export const SLEEVE_ASPECT = SLEEVE_SHAPES.record.aspect

const SLEEVE_VERTEX = `attribute vec3 p;attribute vec3 n;attribute vec2 t;attribute float f;
uniform mat4 mvp;uniform mat4 model;uniform mat3 rot;
varying vec3 vN;varying vec3 vW;varying vec2 vT;varying float vF;varying vec3 vL;varying vec3 vLN;
void main(){vN=rot*n;vW=(model*vec4(p,1.)).xyz;vT=t;vF=f;vL=p;vLN=n;gl_Position=mvp*vec4(p,1.);}`

/**
 * A CD's jewel case (`mode` 2): a clear, hard lid over a black tray, the booklet's cover under the lid right of the hinge. The lid is glossy polystyrene, not film: a sharp highlight and the crisp edges of a
 * window reflected in it, and no creases. On the left of the face the hinge's ridges run top to bottom, the black tray shows in the margins round the booklet with its edge just inside the lid's, and two
 * tabs hold the booklet on the right. The spine is the back insert's edge seen dark through the tray, between the hinge's knuckles.
 */
const JEWEL_CASE = `vec3 jewelCase(vec3 N,vec3 L,vec3 V,vec3 H,float front,float spine,vec2 uv,float inPoster){
  float grain=hash(floor(vT*420.))-.5;
  vec3 base=vec3(.045,.045,.05)*(1.+grain*.3);
  vec3 Nf=N;
  float lum=0.;
  if(front>.5){
    if(inPoster>.5)base=texture2D(cover,uv).rgb;
    lum=dot(base,vec3(.299,.587,.114));
    // The hinge: a strip of the lid 10 mm wide, smoky, with fine ridges running top to bottom that each catch the light on the side toward it.
    float band=step(vT.x,.07);
    float ridges=step(.012,vT.x)*step(vT.x,.058);
    base=mix(base,vec3(.085,.085,.095)*(1.+grain*.2),band);
    Nf=normalize(N+vec3(cos(vT.x/.0092*6.2832)*.45*ridges,0.,0.));
    // The knuckles of the hinge at the top and the bottom.
    base=mix(base,vec3(.15,.15,.16),step(vT.x,.035)*(step(vT.y,.07)+step(.93,vT.y))*.7);
  }else if(vF>2.5){
    // The back insert through the clear tray.
    base=backOf()*.85;
  }else if(spine>.5){
    // The back insert's spine through the tray's clear side, dark, with the seams of the lid and the tray along it and the knuckles at the ends.
    base=texture2D(cover,vec2(.012,vT.y)).rgb*.4+.02;
    base*=1.-.6*(1.-smoothstep(0.,.03,abs(vT.x-.82)))-.4*(1.-smoothstep(0.,.03,abs(vT.x-.18)));
    base=mix(base,vec3(.13,.13,.14),step(vT.y,.07)+step(.93,vT.y));
  }else{
    // The edges of the lid and the tray: clear plastic over black.
    base=vec3(.16,.165,.18)*(1.+grain*.2);
  }
  float nh=max(dot(Nf,H),0.);
  vec3 col=base*(.62+.38*max(dot(Nf,L),0.));
  if(front>.5){
    float edge=min(min(vT.x,1.-vT.x),min(vT.y,1.-vT.y));
    // The tray's edge seen through the lid, just inside the lid's own, right, top and bottom.
    float rim=min(1.-vT.x,min(vT.y,1.-vT.y));
    col+=(1.-smoothstep(0.,.0025,abs(rim-.011)))*step(.07,vT.x)*.07;
    // The tabs that hold the booklet on the right.
    float tab=step(.938,vT.x)*step(vT.x,.962)*(step(abs(vT.y-.25),.045)+step(abs(vT.y-.75),.045));
    col=mix(col,vec3(.6,.62,.66),tab*.18);
    // The lid: a mirror of the room, a sharp highlight and a window's two panes with hard edges that move with the angle, and more of it at a glancing angle (Fresnel).
    float fres=.04+.96*pow(1.-max(dot(Nf,V),0.),5.);
    float s=(vT.x+(1.-vT.y))*.7-(.72+light.x*.32-light.y*.2);
    float pane=(1.-smoothstep(.055,.06,abs(s)))*.13+(1.-smoothstep(.012,.015,abs(s+.16)))*.09;
    float give=1.-.45*lum;
    col+=(pow(nh,900.)*.6+pow(nh,60.)*.05+pane)*give;
    col=mix(col,vec3(1.),(.02+fres*.45)*give);
    col+=(1.-smoothstep(0.,.006,edge))*.2;
  }else{
    col+=vec3(1.)*(pow(nh,60.)*.35+pow(nh,8.)*.05);
  }
  return col;
}`

/**
 * An old console's cardboard box (`mode` 3): the picture printed over the whole face, and its edge's colours round the sides, under a thin laminate with a soft sheen and no film. Years of shelves have
 * rubbed its edges and corners pale (the card showing through the print, unevenly), and a faint fold runs across it where it was once pressed.
 */
const CARDBOARD_BOX = `vec3 cardboardBox(vec3 N,vec3 L,vec3 V,vec3 H,float front,float spine,vec2 uv){
  float grain=hash(floor(vT*300.))-.5;
  vec3 base=front>.5?texture2D(cover,clamp(uv,0.,1.)).rgb:vF>2.5?backOf():spine>.5?texture2D(cover,vec2(.012,vT.y)).rgb*.78:texture2D(cover,vec2(vT.x,.012)).rgb*.7;
  float lum=dot(base,vec3(.299,.587,.114));
  // Printed card: the print stands up where it is light and the card's fibre shows, so the light rakes across it.
  if(front>.5)N=emboss(N,clamp(uv,0.,1.),1.6);
  H=normalize(L+V);
  vec3 col=base*(.6+.4*max(dot(N,L),0.))*(1.+grain*.04);
  float edge=min(min(vT.x,1.-vT.x),min(vT.y,1.-vT.y));
  float corner=length(vec2(min(vT.x,1.-vT.x)*.67,min(vT.y,1.-vT.y)));
  float rub=hash(floor(vT*90.));
  float wear=(1.-smoothstep(0.,.006+.012*rub,edge))*.55+(1.-smoothstep(0.,.03+.02*rub,corner))*.5;
  float fold=(1.-smoothstep(0.,.004,abs(vT.y-.62-sin(vT.x*7.)*.01)))*.05*front;
  col=mix(col,vec3(.9,.88,.83),min(wear,.8)*(front>.5?1.:.6));
  col*=1.-fold;
  float nh=max(dot(N,H),0.);
  float fres=.04+.96*pow(1.-max(dot(N,V),0.),5.);
  col+=(pow(nh,24.)*.1+pow(nh,120.)*.12)*(1.-.5*lum);
  col=mix(col,vec3(1.),fres*.18);
  return col;
}`

/**
 * What makes the case a thing in the hand and not a picture: its edges are rounded (the normal bends round them over `bevel`, so each edge catches a line of light and turns dark on the far side), the
 * print on card stands up a little where it is light (embossed: the picture's own brightness bends the normal, so the light rakes across it), and the back is printed too, as a back cover is: the
 * cover's colours, a block of text and a barcode on a white patch, for when it is turned round.
 */
const SURFACE = `vec3 bent(){
  vec3 d=ext-abs(vL);
  vec3 w=(1.-smoothstep(0.,bevel,d))*(1.-abs(vLN));
  return normalize(rot*(vLN+sign(vL)*w));
}
vec3 emboss(vec3 N,vec2 uv,float k){
  vec2 e=vec2(1./420.,0.);
  vec3 y=vec3(.299,.587,.114);
  float du=dot(texture2D(cover,uv+e.xy).rgb-texture2D(cover,uv-e.xy).rgb,y);
  float dv=dot(texture2D(cover,uv+e.yx).rgb-texture2D(cover,uv-e.yx).rgb,y);
  vec3 T=rot*vec3(1.,0.,0.);vec3 B=rot*vec3(0.,-1.,0.);
  float fibre=hash(floor(vT*520.))-.5;
  return normalize(N-(T*du+B*dv)*k+(T-B)*fibre*.02*k);
}
vec3 backOf(){
  vec3 c=vec3(0.);
  for(int i=0;i<3;i++)for(int j=0;j<3;j++)c+=texture2D(cover,vec2(.2+.3*float(i),.2+.3*float(j))).rgb;
  c=mix(c/9.,texture2D(cover,vec2(.5,.15)).rgb,.35*(1.-vT.y));
  float lum=dot(c,vec3(.299,.587,.114));
  vec3 ink=lum>.55?vec3(.08):vec3(.93);
  float row=floor((vT.y-.16)/.052);float inRow=fract((vT.y-.16)/.052);
  float line=step(.16,vT.y)*step(vT.y,.62)*step(.38,inRow)*step(inRow,.64)*step(.14,vT.x)*step(vT.x,.36+.36*hash(vec2(row,3.)));
  c=mix(c,ink,line*.6);
  float plate=step(.6,vT.x)*step(vT.x,.88)*step(.76,vT.y)*step(vT.y,.92);
  float bars=step(.63,vT.x)*step(vT.x,.85)*step(.79,vT.y)*step(vT.y,.88)*step(.42,hash(vec2(floor(vT.x*170.),1.)));
  return mix(mix(c,vec3(.95),plate),vec3(.05),bars);
}`

const SLEEVE_FRAGMENT = `precision highp float;
varying vec3 vN;varying vec3 vW;varying vec2 vT;varying float vF;varying vec3 vL;varying vec3 vLN;
uniform sampler2D cover;uniform vec2 light;uniform vec4 inset;uniform float mode;uniform vec2 fit;uniform mat3 rot;uniform vec3 ext;uniform float bevel;
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
${SURFACE}
${JEWEL_CASE}
${CARDBOARD_BOX}
void main(){
  vec3 N=bent();
  vec3 L=normalize(vec3(light.x,-light.y,1.2));
  vec3 V=normalize(vec3(0.,0.,3.)-vW);
  vec3 H=normalize(L+V);
  float nh=max(dot(N,H),0.);
  float front=step(.5,vF)*(1.-step(1.5,vF));
  float spine=step(1.5,vF)*(1.-step(2.5,vF));
  float back=step(2.5,vF);
  vec2 lo=inset.xy;vec2 hi=1.-inset.zw;
  vec2 at=(vT-lo)/(hi-lo);
  // The picture fills the face as a cover does (object-fit: cover): cropped to the face's shape, about its middle.
  vec2 uv=(at-.5)*fit+.5;
  float inPoster=step(0.,at.x)*step(at.x,1.)*step(0.,at.y)*step(at.y,1.);
  if(mode>2.5){gl_FragColor=vec4(cardboardBox(N,L,V,H,front,spine,uv),1.);return;}
  if(mode>1.5){gl_FragColor=vec4(jewelCase(N,L,V,H,front,spine,uv,inPoster),1.);return;}
  float dvd=step(.5,mode);
  // Card has a fine grain; a DVD case is matte black plastic with a stipple.
  float grain=hash(floor(vT*420.))-.5;
  vec3 shell=mix(vec3(.5,.48,.44)*(1.+grain*.06),vec3(.055,.055,.062)*(1.+grain*.4),dvd);
  vec3 base=shell;
  if(front>.5&&inPoster>.5)base=texture2D(cover,uv).rgb;
  // The back cover: on card it is the card's, in a DVD case the insert's under the sleeve, inside the rim.
  if(back>.5&&(dvd<.5||inPoster>.5))base=backOf();
  // A record's sleeve is printed card: its print stands up a little under the film.
  if(front>.5&&dvd<.5)N=emboss(N,uv,1.1);
  // The spine is the cover's edge printed round it (on a DVD, the insert's spine under the clear sleeve).
  if(spine>.5)base=texture2D(cover,vec2(.012,vT.y)).rgb*mix(.72,.6,dvd);
  float edge=min(min(vT.x,1.-vT.x),min(vT.y,1.-vT.y));
  vec3 col=base*(.62+.38*max(dot(N,L),0.));
  if(front>.5){
    col*=.8+.2*smoothstep(0.,.03,edge);
    if(dvd<.5){
      // Ring wear: the record inside has rubbed a faint circle into the card over the years, and the corners are worn pale.
      float d=length(vT-.5);
      float scuff=.4+.6*hash(floor(vT*160.));
      float ring=exp(-pow((d-.455)/.014,2.))*.09+smoothstep(.47,.25,d)*.025;
      float corner=1.-smoothstep(0.,.045,length(vec2(min(vT.x,1.-vT.x),min(vT.y,1.-vT.y))));
      col=mix(col,vec3(.93,.91,.87),(ring+corner*.22)*scuff);
    }else{
      // The clear sleeve's edge over the poster is a thin bright lip, and the rim by the spine has the hinge's groove.
      vec2 inside=min(at,1.-at)*(hi-lo);
      col+=(1.-smoothstep(0.,.005,abs(min(inside.x,inside.y))))*.1;
      col*=1.-(1.-smoothstep(0.,.004,abs(vT.x-inset.x*.45)))*.6;
    }
    // The shrink-wrap (a DVD's clear sleeve): a film over the cover, not a hard gloss. It creases near the edges (a ripple in its normal there), reflects a soft box as a broad diagonal streak with a thin one
    // beside it that move with the angle, hazes over at a glancing angle (Fresnel) and catches light where it folds over the edge. It is light on top of the cover, so it shows less on pale art than on dark.
    float lum=dot(base,vec3(.299,.587,.114));
    float crease=sin(vT.x*61.+sin(vT.y*23.)*2.1)*sin(vT.y*47.+vT.x*9.)*(1.-smoothstep(0.,.16,edge))*(1.-.75*dvd);
    vec3 Nf=normalize(N+vec3(crease*.05,crease*.035,0.));
    float nhf=max(dot(Nf,H),0.);
    float fres=.04+.96*pow(1.-max(dot(Nf,V),0.),5.);
    float s=(vT.x+(1.-vT.y))*.7-(.72+light.x*.32-light.y*.2)+crease*.012;
    float streak=exp(-s*s*70.)*.2+exp(-(s+.17)*(s+.17)*900.)*.12;
    float give=(1.-.6*lum)*(1.-.45*dvd*(1.-inPoster));
    col+=(pow(nhf,140.)*.38+pow(nhf,18.)*.06+streak)*give;
    col=mix(col,vec3(1.),(.025+fres*.35)*give);
    col+=(1.-smoothstep(0.,.012,edge))*.14*give;
  }else{
    // The sides: card takes the light softly, black plastic has a sheen.
    col+=vec3(1.)*(pow(nh,40.)*.28*dvd+pow(nh,8.)*.04);
  }
  gl_FragColor=vec4(col,1.);
}`

const DISC_VERTEX = `attribute vec2 p;uniform mat4 mvp;uniform mat4 model;uniform vec2 span;varying vec2 v;varying vec3 vW;
void main(){v=p*span;vW=(model*vec4(v,0.,1.)).xyz;gl_Position=mvp*vec4(v,0.,1.);}`

/** What both discs share: their light, the directions of their tracks at the point, and the colours of the spectrum by wavelength. */
const DISC_COMMON = `precision highp float;
varying vec2 v;varying vec3 vW;
uniform vec3 label;uniform vec2 light;uniform float roll;uniform mat3 rot;uniform float lip;uniform float side;
vec3 hue(float h){return clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);}
vec3 spectrum(float w){float t=(w-380.)/320.;if(t<0.||t>1.)return vec3(0.);return hue(.75*(1.-t))*smoothstep(0.,.12,t)*smoothstep(1.,.85,t);}
float hash1(float x){return fract(sin(x*12.9898)*43758.5453);}`

const DISC_FRAGMENT = `${DISC_COMMON}
void main(){
  float r=length(v);
  if(r>1.)discard;
  float edge=1.-smoothstep(.985,1.,r);
  vec2 dir=v/max(r,1e-4);
  vec3 N=normalize(rot*vec3(0.,0.,side));
  // The rim is rounded and the grooves are cut into the vinyl: the normal leans out at the rim and ripples across each groove, so the light runs round the edge and along the rings.
  vec3 R=rot*vec3(dir,0.);
  N=normalize(N+R*(smoothstep(.95,1.,r)*1.1+sin(r*900.)*.035*smoothstep(.43,.45,r)*(1.-smoothstep(.955,.965,r))));
  vec3 L=normalize(vec3(light.x,-light.y,1.2));
  vec3 V=normalize(vec3(0.,0.,3.)-vW);
  vec3 H=normalize(L+V);
  vec3 T=normalize(rot*vec3(-dir.y,dir.x,0.));
  vec2 lit=normalize(vec2(light.x,-light.y)+1e-4);
  float a=atan(v.y,v.x);
  // Coloured vinyl in the cover's own colour, deep where it is thick, with the light coming through it toward the rim on the lit side.
  vec3 tint=label/max(max(label.r,max(label.g,label.b)),.2);
  vec3 col=(label*.4+.015)*(.78+.22*max(dot(N,L),0.))+tint*.18*smoothstep(.6,1.,r)*max(dot(dir,lit),0.);
  // The grooves: fine rings with smooth gaps between the songs, from the lead-in at the rim to a wide run-out before the label.
  float gap=0.;
  for(int i=0;i<4;i++){gap=max(gap,1.-smoothstep(.003,.009,abs(r-(.52+float(i)*.105))));}
  float grooved=smoothstep(.43,.45,r)*(1.-smoothstep(.955,.965,r))*(1.-gap);
  col*=1.-.06*grooved*(.5+.5*sin(r*900.));
  // Each groove is a ridge round the record, so the light comes back as a fan along the radius, toward the light and away from it, where the groove runs across the half vector.
  // Head on, the fan spreads over the whole record and is faint; at an angle it gathers into a bright bar.
  float across=dot(T,H);
  float slant=length(H-N*dot(H,N));
  col+=mix(vec3(1.),tint,.45)*exp(-across*across*500.)*grooved*(.06+.7*smoothstep(.02,.15,slant));
  // The smooth parts (the gaps, the run-out, the rim) are a mirror with a small sharp highlight.
  col+=pow(max(dot(N,H),0.),90.)*.5*(1.-grooved)*step(.35,r);
  if(r<.35){
    // The label: pale paper of the vinyl's colour, a printed ring and two lines of print, turning as the record rolls out.
    vec2 q=vec2(cos(roll)*v.x+sin(roll)*v.y,-sin(roll)*v.x+cos(roll)*v.y);
    col=mix(label,vec3(.96,.94,.9),.55)*(.9+.1*cos(2.*(a+roll)));
    float print=(1.-smoothstep(.003,.006,abs(r-.3)))+(step(abs(q.y+.14),.012)+step(abs(q.y+.19),.007))*step(abs(q.x),.16-abs(q.y)*.3);
    col*=1.-min(print,1.)*.35;
    col+=pow(max(dot(N,H),0.),30.)*.06;
    if(r<.045)col=vec3(.03);
  }
  // The rim is a rounded bead, lit on the side toward the light.
  col+=smoothstep(.96,.99,r)*max(dot(dir,lit),0.)*.18;
  // Where it comes out of the sleeve it lies in the sleeve's shadow.
  col*=1.-.5*(1.-smoothstep(lip,lip+.25,v.x));
  gl_FragColor=vec4(col*edge,edge);
}`

const DVD_FRAGMENT = `${DISC_COMMON}
void main(){
  float r=length(v);
  // The hole in the middle (15 of 120 mm) shows what is behind.
  if(r>1.||r<.118)discard;
  float edge=(1.-smoothstep(.985,1.,r))*smoothstep(.118,.128,r);
  vec2 dir=v/max(r,1e-4);
  vec3 N=normalize(rot*vec3(0.,0.,side));
  vec3 L=normalize(vec3(light.x,-light.y,1.2));
  vec3 V=normalize(vec3(0.,0.,3.)-vW);
  vec3 H=normalize(L+V);
  vec3 T=normalize(rot*vec3(-dir.y,dir.x,0.));
  vec3 R=normalize(rot*vec3(dir,0.));
  vec3 tint=label/max(max(label.r,max(label.g,label.b)),.2);
  float a=atan(v.y,v.x);
  // The silver is a mirror of the room: lighter above than below, and bright where the light is.
  vec3 Rf=reflect(-V,N);
  float room=.42+.32*smoothstep(-.6,.7,Rf.y)+.12*pow(max(dot(Rf,L),0.),4.);
  vec3 silver=vec3(.74,.75,.8)*room+tint*.035;
  vec3 col=silver;float alpha=1.;
  if(r<.2){
    // The clear hub, with its embossed ring.
    col=vec3(.84,.86,.9)*room;alpha=.3+.4*exp(-pow((r-.165)/.004,2.));
  }else if(r<.235){
    col=silver*.84;
  }else if(r<.36){
    col=silver*1.04;
  }else if(r<.385){
    // The burst cutting area: the disc's own barcode.
    col=silver*mix(1.,.8,step(.55,hash1(floor((a+3.1416)*60.))));
  }else{
    col=silver*vec3(.96,.94,.99)*.9;
    // The tracks are a grating: the light comes back split into its colours where they run across the half vector, each colour at the angle its wavelength bends to (first and second order).
    float along=dot(T,L+V);
    float s=abs(dot(R,L+V));
    vec3 split=spectrum(2300.*s)+.6*spectrum(1150.*s);
    col+=split*exp(-along*along*14.)*.85*smoothstep(.385,.41,r)*(1.-smoothstep(.95,.97,r));
    col+=exp(-pow((r-.955)/.006,2.))*.06;
  }
  col+=pow(max(dot(N,H),0.),400.)*.55;
  col*=1.-.25*smoothstep(.97,1.,r);
  col*=1.-.5*(1.-smoothstep(lip,lip+.25,v.x));
  float cover=alpha*edge;
  gl_FragColor=vec4(col*cover,cover);
}`

/**
 * A CD, seen from its data side: as a DVD's (`spectrum()` of the angle between the tracks and the light), but its tracks are 1.6 µm apart, not 0.74, so each colour bends at a smaller angle and more orders
 * of the rainbow come round (four, narrower and closer together). A pressed CD's hub is clear and wide (the clamping area to 33 mm, with the stacking ring and the matrix number moulded in), the mirror of
 * the lead-in round it, and the music stops short of the rim: past it the disc is a plain mirror with no colours, and the last 1.5 mm is clear plastic.
 */
const cdFragment = (silver: string, rainbow: string) => `${DISC_COMMON}
void main(){
  float r=length(v);
  if(r>1.||r<.125)discard;
  float edge=(1.-smoothstep(.985,1.,r))*smoothstep(.125,.135,r);
  vec2 dir=v/max(r,1e-4);
  vec3 N=normalize(rot*vec3(0.,0.,side));
  vec3 L=normalize(vec3(light.x,-light.y,1.2));
  vec3 V=normalize(vec3(0.,0.,3.)-vW);
  vec3 H=normalize(L+V);
  vec3 T=normalize(rot*vec3(-dir.y,dir.x,0.));
  vec3 R=normalize(rot*vec3(dir,0.));
  vec3 tint=label/max(max(label.r,max(label.g,label.b)),.2);
  float a=atan(v.y,v.x);
  vec3 Rf=reflect(-V,N);
  float room=.42+.32*smoothstep(-.6,.7,Rf.y)+.12*pow(max(dot(Rf,L),0.),4.);
  vec3 silver=vec3(${silver})*room+tint*.03;
  vec3 col=silver;float alpha=1.;
  if(r<.275){
    // The clear hub: the stacking ring, and the matrix number as a dashed ring.
    col=vec3(.84,.86,.9)*room;
    float matrix=step(.55,hash1(floor((a+3.1416)*70.)))*(1.-smoothstep(.004,.007,abs(r-.235)));
    alpha=.22+.4*exp(-pow((r-.19)/.005,2.))+.3*exp(-pow((r-.272)/.004,2.))+.18*matrix;
  }else if(r<.385){
    col=vec3(.76,.77,.8)*room*1.05;
  }else if(r<.975){
    col=silver*vec3(.97,.96,.99)*.9;
    // The music ends at r .9: a faint step in the silver where the pits stop.
    float music=1.-smoothstep(.895,.905,r);
    col*=1.+.06*(1.-music);
    // Measured against the light's slant across the disc, so that head on the colours still gather in a fan along the radius toward the light, as a lamp's do, and do not fill whole rings.
    vec3 P=(L+V)-N*dot(N,L+V);
    float along=dot(T,P)/(length(P)+.02);
    float s=abs(dot(R,L+V));
    vec3 split=spectrum(4970.*s)+.6*spectrum(2485.*s)+.36*spectrum(1657.*s)+.2*spectrum(1243.*s);
    col+=split*exp(-along*along*12.)*${rainbow}*smoothstep(.385,.41,r)*music;
  }else{
    // The clear rim outside the metal.
    col=vec3(.85,.87,.9)*room;alpha=.35;
  }
  col+=pow(max(dot(N,H),0.),400.)*.55;
  col*=1.-.5*(1.-smoothstep(lip,lip+.25,v.x));
  float cover=alpha*edge;
  gl_FragColor=vec4(col*cover,cover);
}`

const CD_FRAGMENT = cdFragment(".76,.77,.8", ".6")

/** The first PlayStation's disc: as a CD's, but its data side is black (dyed to tell it from a copy), so it is a dark mirror with the rainbows faint in it; the hub round the hole is a CD's silver. */
const PSX_FRAGMENT = cdFragment(".1,.085,.12", ".32")

/**
 * A cartridge (`CARTS`), standing upright and slid out sideways: the console's plastic in its outline (round, or cut at a corner or the shoulders), a ridged grip and grooves where it has them, and a label of
 * the box picture (its middle, cropped to the label) in a shallow recess under a glossy film that catches the light. It is the case's picture again, so it reads as that game's cartridge.
 */
const CARTRIDGE_FRAGMENT = `${DISC_COMMON}
uniform sampler2D cover;uniform vec2 size;uniform vec3 body;uniform vec4 labelBox;uniform vec3 grip;uniform float grooves;uniform vec4 outline;uniform float coverAspect;
float box(vec2 p,vec2 b,float r){vec2 d=abs(p)-b+r;return length(max(d,0.))+min(max(d.x,d.y),0.)-r;}
float outlineOf(vec2 p){
  float d=box(p,size,p.y>0.?outline.x:outline.y);
  if(outline.z>0.)d=max(d,(p.x+p.y)-(size.x+size.y-outline.z));
  if(outline.w>0.)d=max(d,(abs(p.x)+p.y)-(size.x+size.y-outline.w));
  return d;
}
void main(){
  float d=outlineOf(v);
  float edge=1.-smoothstep(-.012,0.,d);
  if(edge<=0.)discard;
  // Moulded plastic: its edge is rounded, so the normal leans out along the outline's own slope there.
  vec2 slope=normalize(vec2(outlineOf(v+vec2(.01,0.))-outlineOf(v-vec2(.01,0.)),outlineOf(v+vec2(0.,.01))-outlineOf(v-vec2(0.,.01)))+1e-5);
  vec3 N=normalize(rot*vec3(slope*smoothstep(-.09,0.,d)*1.2,side));
  vec3 L=normalize(vec3(light.x,-light.y,1.2));
  vec3 V=normalize(vec3(0.,0.,3.)-vW);
  vec3 H=normalize(L+V);
  float nh=max(dot(N,H),0.);
  float grain=hash1(floor(v.x*140.)+floor(v.y*140.)*157.)-.5;
  vec3 col=body*(.62+.38*max(dot(N,L),0.))*(1.+grain*.08);
  // The grip: fine ridges across, each catching the light on its upper side.
  float onGrip=step(grip.x,v.y)*step(v.y,grip.y)*step(abs(v.x),grip.z);
  col+=onGrip*(.04+body*.25)*smoothstep(.2,.9,sin(v.y*180.));
  col*=1.-onGrip*.25*(1.-smoothstep(.2,.9,sin(v.y*180.)));
  // The grooves down both sides: a dark line with a lit lip.
  if(grooves>0.){float g=abs(abs(v.x)-grooves);col*=1.-(1.-smoothstep(.006,.016,g))*.45*step(abs(v.y),size.y*.8);}
  // A bevel round the edge, bright on the side toward the light.
  vec2 lit=normalize(vec2(light.x,-light.y)+1e-4);
  col+=smoothstep(-.06,-.015,d)*max(dot(normalize(v),lit),0.)*(.08+dot(body,vec3(.33))*.2);
  // The label: the middle of the box picture, cropped to the label's shape, under a glossy film, in a shallow recess.
  vec2 lo=labelBox.xy;vec2 hi=labelBox.zw;
  vec2 q=(v-lo)/(hi-lo);
  float onLabel=step(0.,q.x)*step(q.x,1.)*step(0.,q.y)*step(q.y,1.)*step(0.,side);
  vec2 m=min(q,1.-q)*(hi-lo);
  float recess=1.-smoothstep(0.,.035,-min(m.x,m.y));
  col*=1.-(1.-onLabel)*recess*.3;
  if(onLabel>.5){
    float shape=(hi.x-lo.x)/(hi.y-lo.y);
    vec2 f=coverAspect>shape?vec2(shape/coverAspect,1.):vec2(1.,coverAspect/shape);
    vec3 art=texture2D(cover,vec2(.5+(q.x-.5)*f.x,.5-(q.y-.5)*f.y)).rgb;
    float lum=dot(art,vec3(.299,.587,.114));
    col=art*(.7+.3*max(dot(N,L),0.));
    float fres=.04+.96*pow(1.-max(dot(N,V),0.),5.);
    float s=(q.x+(1.-q.y))*.6-(.6+light.x*.3-light.y*.2);
    col+=(pow(nh,160.)*.45+exp(-s*s*60.)*.14)*(1.-.5*lum);
    col=mix(col,vec3(1.),fres*.25);
    // The label's own edge, a thin dark line.
    col*=1.-(1.-smoothstep(0.,.02,min(m.x,m.y)))*.5;
  }
  col+=pow(nh,60.)*(.12+dot(body,vec3(.33))*.2)*(1.-onLabel);
  // Where it comes out of the case it lies in the case's shadow.
  col*=1.-.5*(1.-smoothstep(lip,lip+.25,v.x));
  gl_FragColor=vec4(col*edge,edge);
}`

/** The rim of what the case holds (a disc's edge, a cartridge's sides): plastic or vinyl of its own colour, lit, and in the case's shadow where it is inside. */
const EDGE_VERTEX = `attribute vec3 p;attribute vec3 n;uniform mat4 mvp;uniform mat4 model;uniform mat3 rot;varying vec3 vN;varying vec3 vW;varying float vX;
void main(){vN=rot*n;vW=(model*vec4(p,1.)).xyz;vX=p.x;gl_Position=mvp*vec4(p,1.);}`

const EDGE_FRAGMENT = `precision highp float;
varying vec3 vN;varying vec3 vW;varying float vX;uniform vec3 tone;uniform vec2 light;uniform float shine;uniform float lip;
void main(){
  vec3 N=normalize(vN);
  vec3 L=normalize(vec3(light.x,-light.y,1.2));
  vec3 V=normalize(vec3(0.,0.,3.)-vW);
  vec3 H=normalize(L+V);
  vec3 col=tone*(.5+.5*max(dot(N,L),0.))+pow(max(dot(N,H),0.),36.)*shine+pow(1.-max(dot(N,V),0.),4.)*shine*.25;
  col*=1.-.55*(1.-smoothstep(lip,lip+.25,vX));
  gl_FragColor=vec4(col,1.);
}`

/**
 * The rim of what the case holds, as triangles of `x y z  nx ny nz`: in the disc's own units across (its radius 1, or a cartridge's half size) and `thickness` deep, so a disc or a cartridge turned on
 * its side has an edge and is not a sheet of paper. A disc's is a ring; a cartridge's four sides.
 */
export function heldRim(size: readonly [number, number] | null, thickness: number, segments = 64): Float32Array {
  const z = thickness / 2
  const out: number[] = []
  const quad = (a: [number, number], b: [number, number], na: [number, number], nb: [number, number]) => {
    out.push(a[0], a[1], z, na[0], na[1], 0, b[0], b[1], z, nb[0], nb[1], 0, b[0], b[1], -z, nb[0], nb[1], 0)
    out.push(a[0], a[1], z, na[0], na[1], 0, b[0], b[1], -z, nb[0], nb[1], 0, a[0], a[1], -z, na[0], na[1], 0)
  }
  if (size === null) {
    for (let i = 0; i < segments; i += 1) {
      const [a, b] = [(i / segments) * Math.PI * 2, ((i + 1) / segments) * Math.PI * 2]
      quad([Math.cos(a), Math.sin(a)], [Math.cos(b), Math.sin(b)], [Math.cos(a), Math.sin(a)], [Math.cos(b), Math.sin(b)])
    }
  } else {
    const [w, h] = size
    quad([-w, h], [w, h], [0, 1], [0, 1])
    quad([w, h], [w, -h], [1, 0], [1, 0])
    quad([w, -h], [-w, -h], [0, -1], [0, -1])
    quad([-w, -h], [-w, h], [-1, 0], [-1, 0])
  }
  return new Float32Array(out)
}

/** The soft shadow the case and the disc cast on the page behind them, away from the light: it stays on the page while they tilt. */
const SHADOW_VERTEX = `attribute vec2 p;uniform mat4 mvp;uniform vec4 box;varying vec2 q;void main(){q=box.xy+p*box.zw;gl_Position=mvp*vec4(q,0.,1.);}`

const SHADOW_FRAGMENT = `precision highp float;
varying vec2 q;uniform vec2 caseCentre;uniform vec2 caseHalf;uniform vec3 disc;uniform vec2 card;uniform float corner;
float box(vec2 p,vec2 b,float r){vec2 d=abs(p)-b+r;return length(max(d,0.))+min(max(d.x,d.y),0.)-r;}
void main(){
  // A disc's shadow is round; a game card's (card, its half size) is a box.
  float held=card.x>0.?box(q-disc.xy,card,.02):length(q-disc.xy)-disc.z;
  float d=min(box(q-caseCentre,caseHalf,corner),held);
  float a=.24*(1.-smoothstep(-.03,.07,d));
  gl_FragColor=vec4(0.,0.,0.,a);
}`

export interface SleeveRenderer {
  /** `out`: how far the record is out of the sleeve, from 0 (inside) to 1 (half out, at rest); `spin`: how far a hand has turned it round (`yaw`) and tipped it (`pitch`), in radians (`lib/spin.ts`). */
  draw(light: Light, out?: number, spin?: { yaw: number; pitch: number }): void
  /** Sets the size of the drawing in device pixels (the width is the kind's `aspect` times the height). */
  resize(height: number): void
  dispose(): void
}

function compile(gl: WebGLRenderingContext, kind: number, source: string): WebGLShader | null {
  const shader = gl.createShader(kind)
  if (shader === null) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) === true ? shader : null
}

function program(gl: WebGLRenderingContext, vertex: string, fragment: string): WebGLProgram | null {
  const [v, f, p] = [compile(gl, gl.VERTEX_SHADER, vertex), compile(gl, gl.FRAGMENT_SHADER, fragment), gl.createProgram()]
  if (v === null || f === null || p === null) return null
  gl.attachShader(p, v)
  gl.attachShader(p, f)
  gl.linkProgram(p)
  return gl.getProgramParameter(p, gl.LINK_STATUS) === true ? p : null
}

/** The slab: 24 vertices of position, normal, texture coordinate and «front» (1 for the face the cover is on, 2 for the spine on the left, 3 for the back), and the triangles of its six faces. */
function slab(width: number, depth: number): { vertices: Float32Array; indices: Uint16Array } {
  const [hw, hh, hd] = [width / 2, 0.5, depth / 2]
  const faces: { n: [number, number, number]; corners: [number, number, number][]; front: number }[] = [
    { n: [0, 0, 1], corners: [[-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd]], front: 1 },
    { n: [0, 0, -1], corners: [[hw, -hh, -hd], [-hw, -hh, -hd], [-hw, hh, -hd], [hw, hh, -hd]], front: 3 },
    { n: [1, 0, 0], corners: [[hw, -hh, hd], [hw, -hh, -hd], [hw, hh, -hd], [hw, hh, hd]], front: 0 },
    { n: [-1, 0, 0], corners: [[-hw, -hh, -hd], [-hw, -hh, hd], [-hw, hh, hd], [-hw, hh, -hd]], front: 2 },
    { n: [0, 1, 0], corners: [[-hw, hh, hd], [hw, hh, hd], [hw, hh, -hd], [-hw, hh, -hd]], front: 0 },
    { n: [0, -1, 0], corners: [[-hw, -hh, -hd], [hw, -hh, -hd], [hw, -hh, hd], [-hw, -hh, hd]], front: 0 },
  ]
  const uvs: [number, number][] = [[0, 1], [1, 1], [1, 0], [0, 0]]
  const vertices: number[] = []
  const indices: number[] = []
  faces.forEach((face, index) => {
    face.corners.forEach((corner, at) => vertices.push(...corner, ...face.n, ...(uvs[at] ?? [0, 0]), face.front))
    const first = index * 4
    indices.push(first, first + 1, first + 2, first, first + 2, first + 3)
  })
  return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) }
}

const scaling = (s: number): Mat4 => new Float32Array([s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
const stretchX = (s: number): Mat4 => new Float32Array([s, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])

/** How round the case's edges are (the bevel, in the scene's units) for each face: a sleeve's card rounded through, a moulded case well rounded, a jewel case crisp, a cardboard box folded. */
const BEVELS: Readonly<Record<number, (depth: number) => number>> = { 0: (depth) => depth * 0.45, 1: (depth) => Math.min(depth * 0.4, 0.028), 2: () => 0.008, 3: () => 0.014 }

/** How thick what the case holds is, in the scene's units: a record and a disc thin (drawn a little thicker than life, so their edge shows turned), a cartridge as its own share of its height, inside the case. */
const heldThickness = (kind: SleeveKind): number => {
  const shape = SLEEVE_SHAPES[kind]
  const cart = CARTS[kind]
  if (cart !== undefined) return Math.min(shape.disc * 2 * cart.thick, shape.depth * 0.75)
  return kind === "record" ? 0.014 : 0.01
}

/** How far the scene tilts toward the light, in radians for a light at the edge of the screen. */
const TILT = { y: 0.34, x: 0.24 }

/** A renderer for the canvas with the cover on the sleeve (or the poster in the DVD case) and the record's label in `label` (the disc's tint), or `null` where WebGL is not there or the cover may not be read (no CORS). */
export function createSleeveRenderer(canvas: HTMLCanvasElement, cover: TexImageSource, label: Rgb, kind: SleeveKind = "record"): SleeveRenderer | null {
  const shape = SLEEVE_SHAPES[kind]
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true, powerPreference: "low-power" })
  if (gl === null) return null
  const sleeve = program(gl, SLEEVE_VERTEX, SLEEVE_FRAGMENT)
  const cart = CARTS[kind]
  const disc = program(gl, DISC_VERTEX, cart !== undefined ? CARTRIDGE_FRAGMENT : kind === "dvd" ? DVD_FRAGMENT : kind === "cd" ? CD_FRAGMENT : kind === "psx" ? PSX_FRAGMENT : DISC_FRAGMENT)
  const shadow = program(gl, SHADOW_VERTEX, SHADOW_FRAGMENT)
  const rimProgram = program(gl, EDGE_VERTEX, EDGE_FRAGMENT)
  if (sleeve === null || disc === null || shadow === null || rimProgram === null) return null
  const thickness = heldThickness(kind)
  const rim = heldRim(cart === undefined ? null : cart.size, thickness)
  const rimBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, rimBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, rim, gl.STATIC_DRAW)
  const rimTone: readonly [number, number, number] = cart !== undefined ? cart.body : kind === "record" ? [label[0] / 640, label[1] / 640, label[2] / 640] : kind === "psx" ? [0.09, 0.08, 0.1] : [0.6, 0.62, 0.66]
  const { vertices, indices } = slab(shape.width, shape.depth)
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
  const quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  try {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cover)
  } catch {
    return null
  }
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  const at = (p: WebGLProgram, name: string) => gl.getUniformLocation(p, name)
  const sleeveUniforms = { mvp: at(sleeve, "mvp"), model: at(sleeve, "model"), rot: at(sleeve, "rot"), light: at(sleeve, "light"), cover: at(sleeve, "cover"), inset: at(sleeve, "inset"), mode: at(sleeve, "mode"), fit: at(sleeve, "fit"), ext: at(sleeve, "ext"), bevel: at(sleeve, "bevel") }
  const discUniforms = { mvp: at(disc, "mvp"), model: at(disc, "model"), rot: at(disc, "rot"), lip: at(disc, "lip"), label: at(disc, "label"), light: at(disc, "light"), roll: at(disc, "roll"), span: at(disc, "span"), side: at(disc, "side") }
  const rimUniforms = { mvp: at(rimProgram, "mvp"), model: at(rimProgram, "model"), rot: at(rimProgram, "rot"), tone: at(rimProgram, "tone"), light: at(rimProgram, "light"), shine: at(rimProgram, "shine"), lip: at(rimProgram, "lip") }
  const cartUniforms = { cover: at(disc, "cover"), size: at(disc, "size"), body: at(disc, "body"), labelBox: at(disc, "labelBox"), grip: at(disc, "grip"), grooves: at(disc, "grooves"), outline: at(disc, "outline"), coverAspect: at(disc, "coverAspect") }
  // The picture's own shape, and how much of it the face shows (cropped about its middle to the face's shape).
  const coverAspect = "naturalWidth" in cover && cover.naturalHeight > 0 ? cover.naturalWidth / cover.naturalHeight : "width" in cover && Number(cover.height) > 0 ? Number(cover.width) / Number(cover.height) : 1
  const [insetLeft, insetTop, insetRight, insetBottom] = shape.inset
  const faceAspect = (shape.width * (1 - insetLeft - insetRight)) / (1 - insetTop - insetBottom)
  const fit: [number, number] = coverAspect > faceAspect ? [faceAspect / coverAspect, 1] : [1, coverAspect / faceAspect]
  const shadowUniforms = { mvp: at(shadow, "mvp"), box: at(shadow, "box"), caseCentre: at(shadow, "caseCentre"), caseHalf: at(shadow, "caseHalf"), disc: at(shadow, "disc"), card: at(shadow, "card"), corner: at(shadow, "corner") }
  const camera = multiply(perspective((22.5 * Math.PI) / 180, shape.aspect, 0.5, 10), translation(0, 0, -3))
  gl.enable(gl.DEPTH_TEST)
  // Premultiplied: the shadow and the disc's hole and hub let what is behind them through.
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)
  return {
    draw(light, out = 1, spin = { yaw: 0, pitch: 0 }) {
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      // The scene turns about its middle toward the light (the right side comes forward when the light is to the right), and as far round as a hand has turned it.
      const yaw = light.x * TILT.y + spin.yaw
      const pitch = light.y * TILT.x + spin.pitch
      // Turned, its ends come toward the camera: it is drawn a little further off then, so they stay inside the drawing.
      const back = Math.max(0, shape.aspect / 2 - 0.38) * Math.abs(Math.sin(spin.yaw)) + 0.2 * Math.abs(Math.sin(spin.pitch))
      const view = multiply(camera, translation(0, 0, -back))
      const turn = multiply(rotationY(yaw), rotationX(pitch))
      // The case and the disc half out of it are centred together.
      const group = multiply(turn, translation(-shape.reach / 2, 0, 0))
      const rotation = rotationPart(group)
      const lightForShader: [number, number] = [light.x, light.y]
      const discX = (shape.width / 2) * out
      // The shadow on the page first, away from the light and a little down; it does not tilt and hides nothing. Turned round, it narrows to the case's side and widens again.
      const across = Math.cos(spin.yaw)
      gl.depthMask(false)
      gl.useProgram(shadow)
      gl.bindBuffer(gl.ARRAY_BUFFER, quad)
      const shadowPosition = gl.getAttribLocation(shadow, "p")
      gl.enableVertexAttribArray(shadowPosition)
      gl.vertexAttribPointer(shadowPosition, 2, gl.FLOAT, false, 0, 0)
      gl.uniformMatrix4fv(shadowUniforms.mvp, false, multiply(view, multiply(translation(-light.x * 0.045, light.y * 0.03 - 0.03, -0.12), stretchX(Math.sign(across || 1) * Math.max(Math.abs(across), 0.14)))))
      const left = -shape.reach / 2 - shape.width / 2 - 0.12
      const right = -shape.reach / 2 + shape.width / 2 + shape.reach + 0.12
      gl.uniform4f(shadowUniforms.box, (left + right) / 2, 0, (right - left) / 2, 0.62)
      gl.uniform2f(shadowUniforms.caseCentre, -shape.reach / 2, 0)
      gl.uniform2f(shadowUniforms.caseHalf, shape.width / 2, 0.5)
      gl.uniform3f(shadowUniforms.disc, -shape.reach / 2 + discX, 0, shape.disc)
      gl.uniform2f(shadowUniforms.card, cart === undefined ? 0 : shape.disc * cart.size[0], cart === undefined ? 0 : shape.disc * cart.size[1])
      gl.uniform1f(shadowUniforms.corner, MODES[kind] === 1 ? 0.025 : MODES[kind] === 2 ? 0.012 : 0.008)
      gl.disable(gl.DEPTH_TEST)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      gl.enable(gl.DEPTH_TEST)
      gl.depthMask(true)
      // What the case holds next, behind: its part inside the case is hidden by the case by depth. It has two faces and a rim between them, the far face drawn first.
      const held = multiply(group, multiply(translation(discX, 0, 0), scaling(shape.disc)))
      const lip = (shape.width / 2 - discX) / shape.disc
      gl.useProgram(rimProgram)
      gl.bindBuffer(gl.ARRAY_BUFFER, rimBuffer)
      for (const [name, size, offset] of [["p", 3, 0], ["n", 3, 3]] as const) {
        const location = gl.getAttribLocation(rimProgram, name)
        gl.enableVertexAttribArray(location)
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 6 * 4, offset * 4)
      }
      gl.uniformMatrix4fv(rimUniforms.mvp, false, multiply(view, held))
      gl.uniformMatrix4fv(rimUniforms.model, false, held)
      gl.uniformMatrix3fv(rimUniforms.rot, false, rotation)
      gl.uniform3f(rimUniforms.tone, ...rimTone)
      gl.uniform2f(rimUniforms.light, ...lightForShader)
      gl.uniform1f(rimUniforms.shine, cart !== undefined ? 0.12 + rimTone[0] * 0.2 : kind === "record" ? 0.35 : 0.55)
      gl.uniform1f(rimUniforms.lip, lip)
      gl.drawArrays(gl.TRIANGLES, 0, rim.length / 6)
      gl.useProgram(disc)
      gl.bindBuffer(gl.ARRAY_BUFFER, quad)
      const discPosition = gl.getAttribLocation(disc, "p")
      gl.enableVertexAttribArray(discPosition)
      gl.vertexAttribPointer(discPosition, 2, gl.FLOAT, false, 0, 0)
      gl.uniformMatrix3fv(discUniforms.rot, false, rotation)
      // The sleeve's open edge, in the disc's own units: what is left of it is inside.
      gl.uniform1f(discUniforms.lip, lip)
      gl.uniform3f(discUniforms.label, label[0] / 255, label[1] / 255, label[2] / 255)
      gl.uniform2f(discUniforms.light, lightForShader[0], lightForShader[1])
      gl.uniform1f(discUniforms.roll, (out - 1) * 1.6)
      // A wide cartridge is wider than the quad of a disc: the quad is stretched to its width.
      gl.uniform2f(discUniforms.span, Math.max(1, cart?.size[0] ?? 1), 1)
      if (cart !== undefined) {
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.uniform1i(cartUniforms.cover, 0)
        gl.uniform2f(cartUniforms.size, ...cart.size)
        gl.uniform3f(cartUniforms.body, ...cart.body)
        gl.uniform4f(cartUniforms.labelBox, ...cart.label)
        gl.uniform3f(cartUniforms.grip, ...cart.grip)
        gl.uniform1f(cartUniforms.grooves, cart.grooves)
        gl.uniform4f(cartUniforms.outline, ...cart.outline)
        gl.uniform1f(cartUniforms.coverAspect, coverAspect)
      }
      // Which face is toward the camera: the one whose normal, turned, points at it.
      const facing = (rotation[8] ?? 1) >= 0 ? 1 : -1
      for (const side of [-facing, facing]) {
        const face = multiply(held, translation(0, 0, (side * thickness) / 2))
        gl.uniformMatrix4fv(discUniforms.mvp, false, multiply(view, face))
        gl.uniformMatrix4fv(discUniforms.model, false, face)
        gl.uniform1f(discUniforms.side, side)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }
      gl.useProgram(sleeve)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      const stride = 9 * 4
      for (const [name, size, offset] of [["p", 3, 0], ["n", 3, 3], ["t", 2, 6], ["f", 1, 8]] as const) {
        const location = gl.getAttribLocation(sleeve, name)
        gl.enableVertexAttribArray(location)
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset * 4)
      }
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(sleeveUniforms.cover, 0)
      gl.uniformMatrix4fv(sleeveUniforms.mvp, false, multiply(view, group))
      gl.uniformMatrix4fv(sleeveUniforms.model, false, group)
      gl.uniformMatrix3fv(sleeveUniforms.rot, false, rotation)
      gl.uniform2f(sleeveUniforms.light, lightForShader[0], lightForShader[1])
      gl.uniform4f(sleeveUniforms.inset, ...shape.inset)
      gl.uniform1f(sleeveUniforms.mode, MODES[kind])
      gl.uniform2f(sleeveUniforms.fit, ...fit)
      gl.uniform3f(sleeveUniforms.ext, shape.width / 2, 0.5, shape.depth / 2)
      gl.uniform1f(sleeveUniforms.bevel, BEVELS[MODES[kind]]?.(shape.depth) ?? 0.01)
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
    },
    resize(height) {
      const width = Math.round(height * shape.aspect)
      if (canvas.height !== height || canvas.width !== width) {
        canvas.height = height
        canvas.width = width
      }
    },
    dispose() {
      gl.deleteTexture(texture)
      gl.deleteBuffer(vertexBuffer)
      gl.deleteBuffer(indexBuffer)
      gl.deleteBuffer(quad)
      gl.deleteBuffer(rimBuffer)
      gl.deleteProgram(rimProgram)
      gl.deleteProgram(sleeve)
      gl.deleteProgram(disc)
      gl.deleteProgram(shadow)
    },
  }
}
