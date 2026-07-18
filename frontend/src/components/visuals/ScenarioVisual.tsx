import type { Scenario } from '../../data/scenarios'

interface ScenarioVisualProps {
  type: Scenario['visual']
}

export function ScenarioVisual({ type }: ScenarioVisualProps) {
  return (
    <svg className={`scenario-visual scenario-visual--${type}`} viewBox="0 0 640 430" role="img" aria-label={`${type} 场景语义接口抽象图`}>
      <g className="scenario-grid">
        {Array.from({ length: 10 }, (_, i) => <path key={`v${i}`} d={`M40 ${30 + i * 42}H600`} />)}
        {Array.from({ length: 13 }, (_, i) => <path key={`h${i}`} d={`M55 ${20 + i * 44}V410`} />)}
      </g>
      {type === 'medical' && <MedicalGraphic />}
      {type === 'education' && <EducationGraphic />}
      {type === 'service' && <ServiceGraphic />}
      {type === 'public' && <PublicGraphic />}
    </svg>
  )
}

function MedicalGraphic() {
  return <g className="scenario-graphic">
    <path className="scenario-line" d="M72 234h87l24-61 43 127 40-94 28 28h92" />
    <rect x="382" y="85" width="184" height="256" rx="12" />
    <circle cx="474" cy="157" r="43" />
    <path d="M474 134v46M451 157h46" />
    <rect x="416" y="230" width="116" height="10" rx="5" />
    <rect x="416" y="260" width="79" height="10" rx="5" />
    <rect x="416" y="290" width="98" height="10" rx="5" />
    <circle className="scenario-pulse" cx="294" cy="234" r="8" />
    <text x="72" y="214">SEMANTIC VITAL SIGNAL</text>
  </g>
}

function EducationGraphic() {
  return <g className="scenario-graphic">
    <path d="M102 107h190c26 0 47 21 47 47v186H149c-26 0-47-21-47-47z" />
    <path d="M538 107H348c-26 0-47 21-47 47v186h190c26 0 47-21 47-47z" />
    {[154,198,242,286].map((y) => <path key={y} d={`M140 ${y}h118M382 ${y}h118`} />)}
    <path className="scenario-line" d="M301 338V154c0-26 21-47 47-47" />
    <circle className="scenario-pulse" cx="301" cy="220" r="9" />
    <text x="320" y="383" textAnchor="middle">STRUCTURED LEARNING CONTEXT</text>
  </g>
}

function ServiceGraphic() {
  return <g className="scenario-graphic">
    <rect x="76" y="76" width="204" height="278" rx="16" />
    <rect x="360" y="122" width="204" height="184" rx="16" />
    <path className="scenario-line" d="M280 215H360" />
    <circle className="scenario-pulse" cx="320" cy="215" r="8" />
    {[126,177,228,279].map((y,i) => <g key={y}><circle cx="117" cy={y} r="10" /><path d={`M144 ${y}h92`} /><text x="154" y={y-12}>{['INPUT','TOKEN','CONTEXT','INTENT'][i]}</text></g>)}
    <text x="462" y="176" textAnchor="middle">API ROUTING</text>
    <path d="M406 218h112M406 252h78" />
    <text x="462" y="282" textAnchor="middle">READY</text>
  </g>
}

function PublicGraphic() {
  return <g className="scenario-graphic">
    <path d="M82 325h476M122 325V169h396v156M92 169h456L320 78z" />
    {[161,240,320,399,478].map((x) => <path key={x} d={`M${x} 197v101`} />)}
    <path className="scenario-line" d="M92 360h456" />
    {[144,232,320,408,496].map((x,i) => <g key={x}><circle className={i===2?'scenario-pulse':''} cx={x} cy="360" r="8" /><path d={`M${x} 360v-25`} /></g>)}
    <text x="320" y="132" textAnchor="middle">ACCESSIBLE PUBLIC INTERFACE</text>
  </g>
}
