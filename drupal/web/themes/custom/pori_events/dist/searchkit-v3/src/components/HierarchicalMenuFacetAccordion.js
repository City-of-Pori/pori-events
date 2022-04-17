import React, { Fragment } from 'react'
import { EuiFacetGroup, EuiTitle, EuiFacetButton } from '@elastic/eui'
import { useSearchkit, FilterLink } from '@searchkit/client'

const EntriesList = ({ entries, loading, facet }) => {
  const api = useSearchkit()

  if (!facet) {
    return null;
  }

  const entriesElements = entries.map((entry) => {
    return (
      <Fragment key={entry.label}>
        <EuiFacetButton
          style={{ height: '28px', marginTop: 0, marginBottom: 0 }}
          quantity={entry.count}
          isSelected={api.isFilterSelected({
            identifier: facet.identifier,
            value: entry.label,
            level: entry.level
          })}
          isLoading={loading}
        >
          <FilterLink
            filter={{ identifier: facet.identifier, value: entry.label, level: entry.level }}
          >
            {entry.label}
          </FilterLink>
        </EuiFacetButton>
        <div style={{ marginLeft: '10px' }}>
          {entry.entries && <EntriesList entries={entry.entries} loading={loading} facet={facet} />}
        </div>
      </Fragment>
    )
  })
  return <EuiFacetGroup>{entriesElements}</EuiFacetGroup>
}

export const HierarchicalMenuFacetAccordion = ({ facet, loading }) => {
    if (!facet) {
        return null;
      }
    return (
  <>
    <EuiTitle size="xxs">
      <h3>{facet.label}</h3>
    </EuiTitle>
    <EntriesList entries={facet.entries} facet={facet} loading={loading} />
  </>
)}

export default HierarchicalMenuFacetAccordion;