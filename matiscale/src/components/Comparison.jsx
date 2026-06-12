import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'

const COLUMNS = ['Matiscale', 'In-house SDR', 'Typical agency']

const ROWS = [
  {
    label: 'Monthly cost',
    cells: ['One flat retainer', '$6k+ salary, tools, ramp', 'Retainer + setup fees'],
  },
  {
    label: 'Time to first meeting',
    cells: ['Inside 30 days', '3–6 months of ramp-up', '4–8 weeks, no promise'],
  },
  {
    label: 'Who does the work',
    cells: ['A senior team, end to end', 'One junior hire you manage', 'A shared pod on templates'],
  },
  {
    label: 'If meetings don’t come',
    cells: ['We work free until they do', 'You still pay the salary', 'You still pay the retainer'],
  },
  {
    label: 'Contract',
    cells: ['Month to month', 'Employment + notice period', '3–6 month lock-in'],
  },
]

export default function Comparison() {
  const ref = useRef(null)
  useSectionReveal(ref)

  return (
    <section className="compare" id="compare" ref={ref}>
      <div className="container">
        <span className="kicker mono" data-reveal>
          Why Matiscale
        </span>
        <h2 className="compare-title" data-reveal>
          Three ways to build pipeline. <em>One that&rsquo;s guaranteed.</em>
        </h2>
        <div className="compare-scroll" data-reveal data-delay="0.15">
          <table className="compare-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="visually-hidden">Criteria</span>
                </th>
                {COLUMNS.map((col, i) => (
                  <th scope="col" key={col} className={i === 0 ? 'is-us' : undefined}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.cells.map((cell, i) => (
                    <td key={COLUMNS[i]} className={i === 0 ? 'is-us' : undefined}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
