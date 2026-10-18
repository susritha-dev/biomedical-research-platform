import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'

type Kind = 'sod1-als' | 'tbi' | 'crispr' | 'drug' | 'general'
interface Props { kind: Kind; activeIndex: number; onSelect: (index: number) => void }

function Ball({ position, scale = [1, 1, 1], color, selected = false, onClick }: {
  position: [number, number, number]; scale?: [number, number, number]; color: string;
  selected?: boolean; onClick?: () => void
}) {
  return <mesh position={position} scale={scale} onClick={(event) => { event.stopPropagation(); onClick?.() }}>
    <sphereGeometry args={[1, 40, 28]} />
    <meshPhysicalMaterial color={color} roughness={0.53} metalness={0.02} clearcoat={0.22}
      emissive={selected ? '#205dc1' : '#000000'} emissiveIntensity={selected ? 0.25 : 0} />
  </mesh>
}

function Tube({ points, color, radius = 0.035 }: {
  points: [number, number, number][]; color: string; radius?: number
}) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), [points])
  return <mesh><tubeGeometry args={[curve, 45, radius, 8, false]} /><meshStandardMaterial color={color} roughness={0.5} /></mesh>
}

function Brain({ selected, onSelect }: { selected: number; onSelect: (n: number) => void }) {
  return <group rotation={[0.04, 0.12, -0.07]}>
    <Ball position={[-0.84, 0, 0]} scale={[1.05, 1.18, 1.03]} color="#db938c" selected={selected === 0} onClick={() => onSelect(0)} />
    <Ball position={[0.84, 0, 0]} scale={[1.05, 1.18, 1.03]} color="#e5a39b" selected={selected === 1} onClick={() => onSelect(1)} />
    {Array.from({ length: 17 }, (_, i) => {
      const t = i * 2.3999, r = Math.sqrt((i + 0.5) / 17)
      const x = Math.cos(t) * r * 1.36, y = Math.sin(t) * r * .86
      return <Tube key={i} points={[[x - .32,y-.08, .92],[x-.14,y+.14,1.04],[x+.09,y-.08,1.11],[x+.29,y+.08,.95]]} color="#a95f65" radius={.023} />
    })}
    <Ball position={[0,-1.02,-.1]} scale={[.43,.58,.47]} color="#d0a79b" selected={selected === 2} onClick={() => onSelect(2)} />
    <Ball position={[1.15,.55,.85]} scale={[.38,.36,.17]} color="#f1ad58" selected={selected === 3} onClick={() => onSelect(3)} />
  </group>
}

function DNA({ selected, onSelect }: { selected: number; onSelect: (n:number)=>void }) {
  const turns = 54
  const a: [number,number,number][] = [], b: [number,number,number][] = []
  for(let i=0;i<=turns;i++){
    const y=(i/turns-.5)*4.2, theta=i/turns*Math.PI*5
    a.push([Math.cos(theta)*.75,y,Math.sin(theta)*.75])
    b.push([-Math.cos(theta)*.75,y,-Math.sin(theta)*.75])
  }
  return <group rotation={[0,0,.12]}>
    <Tube points={a} color="#4e92e2" radius={.075} />
    <Tube points={b} color="#e39e91" radius={.075} />
    {Array.from({length:23},(_,i)=>{
      const j=Math.round(i/22*turns), p=a[j], q=b[j]
      return <Tube key={i} points={[p,q]} color={i%3===0?'#81bdc2':'#b8b5d9'} radius={.032} />
    })}
    <Ball position={[.75,1.25,.05]} scale={[.75,.65,.65]} color="#c7a0d7" selected={selected===2} onClick={()=>onSelect(2)}/>
    <Ball position={[-.2,-.7, .6]} scale={[.28,.3,.28]} color="#e5d681" selected={selected===1} onClick={()=>onSelect(1)}/>
    <Ball position={[0,-1.85,0]} scale={[.35,.18,.3]} color="#87c4a9" selected={selected===3} onClick={()=>onSelect(3)}/>
    <mesh position={[0,1.95,0]} onClick={()=>onSelect(0)}><sphereGeometry args={[.15,16,12]}/><meshStandardMaterial color="#5ad9f3"/></mesh>
  </group>
}

function Neuron({ selected, onSelect }: {selected:number;onSelect:(n:number)=>void}) {
  return <group>
    <Ball position={[-.9,0,0]} scale={[.85,.68,.62]} color="#e8b183" selected={selected===2} onClick={()=>onSelect(2)} />
    <Ball position={[-.9,0,.57]} scale={[.26,.27,.12]} color="#a98ed5" selected={selected===0} onClick={()=>onSelect(0)} />
    {[-1,0,1].map((k)=><Tube key={k} color="#c7876b" radius={.055}
      points={[[-1.4,k*.24,0],[-1.8,k*.52,.1],[-2.15,k*.65,.26],[-2.45,k*.82,.12]]}/>)}
    <Tube color="#e1ae7b" radius={.14} points={[[-.25,0,0],[.4,-.05,0],[1.1,.07,0],[1.8,0,.06],[2.5,.21,.04]]}/>
    {[.25,.85,1.45,2.05].map((x,i)=><Ball key={x} position={[x,0,0]} scale={[.29,.26,.27]}
      color={i===3?'#d9a08e':'#c6ba91'} selected={selected===i} onClick={()=>onSelect(i)}/>)}
    <Ball position={[-1.3,.8,.45]} scale={[.29,.29,.25]} color="#a76b94" selected={selected===1} onClick={()=>onSelect(1)} />
  </group>
}

function Drug({selected,onSelect}:{selected:number;onSelect:(n:number)=>void}) {
 return <group>
   {Array.from({length:9},(_,i)=><Ball key={i} position={[(i%3-1)*.8,Math.floor(i/3)*.65-1.2,-.35]}
     scale={[.48,.48,.48]} color={i%2?'#7da4d7':'#95bea9'} selected={selected===1} onClick={()=>onSelect(1)}/>)}
   {Array.from({length:5},(_,i)=><Ball key={i} position={[1.08+Math.sin(i)*.28,i*.4-.8,.6]}
     scale={[.24,.24,.24]} color={i%2?'#e1b15d':'#d67e81'} selected={selected===0} onClick={()=>onSelect(0)}/>)}
   <Tube points={[[1.4,.3,.3],[1.72,.7,.3],[1.92,1.1,.35]]} color="#aa8bd4" radius={.08}/>
   <Ball position={[1.92,1.1,.35]} scale={[.27,.27,.27]} color="#c7abdc" selected={selected===2} onClick={()=>onSelect(2)} />
   <Ball position={[-1.3,-1.3,.15]} scale={[.28,.28,.28]} color="#e0a2a8" selected={selected===3} onClick={()=>onSelect(3)} />
 </group>
}

function Scene({kind,activeIndex,onSelect}:Props){
 return <>
  <color attach="background" args={['#edf4fb']}/>
  <ambientLight intensity={1.25}/>
  <hemisphereLight args={['#ffffff','#7495b4',1.6]}/>
  <directionalLight position={[5,7,8]} intensity={2.2}/>
  <directionalLight position={[-5,-3,1]} intensity={.8} color="#b7d6ff"/>
  <group position={[0,0,0]}>
   {kind==='tbi'?<Brain selected={activeIndex} onSelect={onSelect}/>:
    kind==='crispr'?<DNA selected={activeIndex} onSelect={onSelect}/>:
    kind==='drug'?<Drug selected={activeIndex} onSelect={onSelect}/>:
    <Neuron selected={activeIndex} onSelect={onSelect}/>}
  </group>
  <OrbitControls enablePan={false} enableDamping minDistance={3.5} maxDistance={10} />
  <Suspense fallback={<Html center>Loading model…</Html>}/>
 </>
}
export function AnatomyModel3D(props:Props){
 return <div className="helix-model-three" aria-label="Interactive illustrative 3D biomedical model. Drag to rotate, scroll to zoom, select structures to inspect.">
  <Canvas camera={{position:[4,2.4,6.5],fov:38}} dpr={[1,1.8]} gl={{antialias:true}}>
   <Scene {...props}/>
  </Canvas>
  <div className="helix-model-three-hint">DRAG TO ROTATE · SCROLL TO ZOOM · CLICK TO INSPECT</div>
 </div>
}
