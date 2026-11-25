import { useEffect, useState } from 'react'
import { inputNodes, outputNodes, perimeterServices, type MapNode, type ServiceId } from '../content'
import { markF, markM } from './Logo'

type Placed = { x: number; y: number; path: string }
type Layout = {
  viewBox: string
  box: { w: number; h: number; cut: number; label: number; note: boolean }
  mark: { x: number; y: number; scale: number }
  inputs: Placed[]
  outputs: Placed[]
  perimeter: string
  captions: { x: number; y: number; text: string; anchor: 'start' | 'middle' | 'end' }[]
  shield: { x: number; y: number; w: number; size: number }
}

// Лінії входять у стійку M і виходять із планок F, тому координати привʼязані до контуру знака.
const desktop: Layout = {
  viewBox: '0 -34 1000 506',
  box: { w: 176, h: 68, cut: 16, label: 22, note: true },
  mark: { x: 396, y: 126, scale: 0.19 },
  inputs: [
    { x: 40, y: 70, path: 'M216 70H300L380 150H396' },
    { x: 40, y: 170, path: 'M216 170H396' },
    { x: 40, y: 270, path: 'M216 270H304L380 194H396' },
    { x: 40, y: 370, path: 'M216 370H226L380 216H396' },
  ],
  outputs: [
    { x: 784, y: 70, path: 'M596 143H620L693 70H784' },
    { x: 784, y: 170, path: 'M596 143H650L677 170H784' },
    { x: 784, y: 270, path: 'M574 206H640L704 270H784' },
    { x: 784, y: 370, path: 'M574 206H610L774 370H784' },
  ],
  perimeter: 'M8 -26H956L992 10V446H44L8 410Z',
  captions: [
    { x: 40, y: 12, text: 'Звідки приходить', anchor: 'start' },
    { x: 960, y: 12, text: 'Що ви отримуєте', anchor: 'end' },
  ],
  shield: { x: 500, y: 446, w: 168, size: 16 },
}

// Знак, вузли й підписи стоять симетрично відносно x = 180.
const mobile: Layout = {
  viewBox: '0 -32 360 596',
  box: { w: 78, h: 44, cut: 8, label: 14, note: false },
  mark: { x: 103, y: 204, scale: 0.14 },
  inputs: [
    { x: 15, y: 44, path: 'M54 66V150L107 203V212' },
    { x: 99, y: 44, path: 'M138 66V200L119 219V224' },
    { x: 183, y: 44, path: 'M222 66V140L131 231V236' },
    { x: 267, y: 44, path: 'M306 66V80L143 243V248' },
  ],
  outputs: [
    { x: 15, y: 488, path: 'M174 336V342L54 462V466' },
    { x: 99, y: 488, path: 'M174 336V372L138 408V466' },
    { x: 183, y: 488, path: 'M234 263H242L250 271V400L222 428V466' },
    { x: 267, y: 488, path: 'M252 216H285L306 237V466' },
  ],
  perimeter: 'M4 -24H336L356 -4V550H24L4 530Z',
  captions: [
    { x: 180, y: 8, text: 'Звідки приходить', anchor: 'middle' },
    { x: 180, y: 530, text: 'Що ви отримуєте', anchor: 'middle' },
  ],
  shield: { x: 180, y: 550, w: 118, size: 13 },
}

function useMotion() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setOn(!query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return on
}

function Packet({ path, color, delay }: { path: string; color: string; delay: number }) {
  return (
    <polygon points="-5,-4 11,-4 5,4 -11,4" fill={color}>
      <animateMotion path={path} dur="2.6s" begin={`${-delay}s`} repeatCount="indefinite" rotate="auto" />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        keyTimes="0;.12;.85;1"
        dur="2.6s"
        begin={`${-delay}s`}
        repeatCount="indefinite"
      />
    </polygon>
  )
}

export default function SystemMap({ shown }: { shown: ReadonlySet<ServiceId> }) {
  const motion = useMotion()
  return (
    <>
      <Diagram layout={desktop} shown={shown} motion={motion} className="hidden w-full lg:block" />
      <Diagram layout={mobile} shown={shown} motion={motion} className="w-full max-w-md lg:hidden" />
    </>
  )
}

function Diagram(props: { layout: Layout; shown: ReadonlySet<ServiceId>; motion: boolean; className: string }) {
  const { layout, shown, motion, className } = props
  const lit = (node: MapNode) => node.services.some((s) => shown.has(s))
  const guarded = perimeterServices.some((s) => shown.has(s))
  const { w, h, cut, label, note } = layout.box

  const renderNode = (node: MapNode, at: Placed, color: string) => {
    const on = lit(node)
    return (
      <g key={node.label} transform={`translate(${at.x} ${at.y - h / 2})`}>
        <path
          className="node"
          d={`M0 0H${w}V${h - cut}L${w - cut} ${h}H0Z`}
          fill={on ? '#1b1a17' : '#0f0f0e'}
          stroke={on ? color : '#3a3731'}
          strokeWidth={on ? 1.75 : 1.25}
        />
        <text
          x={note ? 18 : w / 2}
          y={note ? 30 : h / 2 + label * 0.35}
          textAnchor={note ? 'start' : 'middle'}
          fontSize={label}
          className="node font-display"
          fill={on ? color : '#8f8a7f'}
        >
          {node.label}
        </text>
        {note && (
          <text x={18} y={52} fontSize={15} className="node" fill={on ? '#c9c5bb' : '#79746a'}>
            {node.note}
          </text>
        )}
      </g>
    )
  }

  const renderRoute = (node: MapNode, at: Placed, color: string, out: boolean, i: number) => (
    <g key={node.label}>
      <path d={at.path} fill="none" stroke="#2c2a26" strokeWidth="1.5" />
      <path d={at.path} pathLength={1} className={`route ${out ? 'route-out' : ''} ${lit(node) ? 'on' : ''}`} stroke={color} />
      {motion && lit(node) && <Packet path={at.path} color={color} delay={(out ? 1.3 : 0) + i * 0.45} />}
    </g>
  )

  return (
    <svg viewBox={layout.viewBox} className={className} aria-hidden="true">
      <path d={layout.perimeter} fill="none" stroke="#22201d" strokeWidth="1.5" strokeDasharray="3 7" />
      <path
        d={layout.perimeter}
        pathLength={1}
        className={`route ${guarded ? 'on' : ''}`}
        stroke="#e5c47a"
        style={{ transitionDuration: '1.2s', strokeWidth: 1.75 }}
      />
      {guarded && motion && (
        <path
          d={layout.perimeter}
          pathLength={1}
          className="patrol"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeDasharray=".05 .95"
        />
      )}
      <g style={{ opacity: guarded ? 1 : 0, transition: 'opacity .4s .6s' }}>
        <rect
          x={layout.shield.x - layout.shield.w / 2}
          y={layout.shield.y - 14}
          width={layout.shield.w}
          height="28"
          fill="#141311"
        />
        <text
          x={layout.shield.x}
          y={layout.shield.y + layout.shield.size * 0.35}
          textAnchor="middle"
          fontSize={layout.shield.size}
          fill="#e5c47a"
        >
          Під захистом
        </text>
      </g>

      {layout.captions.map((c) => (
        <text key={c.x + c.text} x={c.x} y={c.y} textAnchor={c.anchor} fontSize={note ? 15 : 13} fill="#8f8a7f">
          {c.text}
        </text>
      ))}

      {inputNodes.map((n, i) => renderRoute(n, layout.inputs[i], '#fafaf8', false, i))}
      {outputNodes.map((n, i) => renderRoute(n, layout.outputs[i], '#e5c47a', true, i))}

      <g transform={`translate(${layout.mark.x} ${layout.mark.y}) scale(${layout.mark.scale})`}>
        <path d={markM} fill="#fff" />
        <path d={markF} fill="#e5c47a" />
      </g>

      {inputNodes.map((n, i) => renderNode(n, layout.inputs[i], '#fafaf8'))}
      {outputNodes.map((n, i) => renderNode(n, layout.outputs[i], '#e5c47a'))}
    </svg>
  )
}
