import { geoAlbersUsa, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import statesTopology from 'us-atlas/states-10m.json'
import type { PeerLink, School } from './types'

export default function PeerMap({ target, peers, schoolById }: { target: School; peers: PeerLink[]; schoolById: Map<string, School> }) {
  const width = 820
  const height = 500
  const states = feature(statesTopology, statesTopology.objects.states) as any
  const projection = geoAlbersUsa().fitSize([width, height], states)
  const path = geoPath(projection)

  const points = [
    { id: target.id, name: target.name, state: target.state, lat: target.location.lat, lon: target.location.lon, target: true },
    ...peers.map((peer) => {
      const s = schoolById.get(peer.peerId)
      return s ? { id: s.id, name: s.name, state: s.state, lat: s.location.lat, lon: s.location.lon, target: false } : null
    }).filter((point): point is { id: string; name: string; state: string; lat: number; lon: number; target: boolean } => point !== null),
  ]

  return <section className="panel mapPanel">
    <div className="sectionHead">
      <div><p className="eyebrow">Geographic context</p><h3>Where are the comparison schools?</h3></div>
      <p>The selected school is emphasized; peers use the current benchmark view.</p>
    </div>
    <div className="mapWrap">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="United States map showing the selected school and its peer schools">
        <g className="states">
          {states.features.map((state: any, index: number) => <path key={index} d={path(state) ?? undefined} />)}
        </g>
        <g className="mapPoints">
          {points.map((point) => {
            const xy = projection([point.lon, point.lat])
            if (!xy) return null
            return <g key={point.id} transform={`translate(${xy[0]},${xy[1]})`} className={point.target ? 'targetPoint' : 'peerPoint'}>
              <circle r={point.target ? 8 : 5} />
              <title>{point.target ? 'Selected school' : 'Peer'}: {point.name}, {point.state}</title>
            </g>
          })}
        </g>
      </svg>
      <div className="mapLegend"><span><i className="legendTarget" /> Selected school</span><span><i className="legendPeer" /> Peer school</span></div>
    </div>
  </section>
}
