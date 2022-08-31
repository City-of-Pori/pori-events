import { FilterLink, useSearchkit, FilterLinkClickRef } from '@searchkit/client'
import { EuiButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import React, { useRef } from 'react'

const NumericRangeFilter = ({ filter, loading }) => {
  const api = useSearchkit()

  return (
    <EuiFlexItem grow={false}>
      <EuiButton
        onClick={() => {
          api.removeFilter(filter)
          api.search()
        }}
        // iconSide="right"
        // iconType="cross"
        isLoading={loading}
      >
        {filter.label}: {filter.min} - {filter.max} ✕
      </EuiButton>
    </EuiFlexItem>
  )
}

const DateRangeFilter = ({ filter, loading }) => {
  const api = useSearchkit()

  return (
    <EuiFlexItem grow={false}>
      <EuiButton
        onClick={() => {
          api.removeFilter(filter)
          api.search()
        }}
        // iconSide="right"
        // iconType="cross"
        isLoading={loading}
      >
        {filter.label}: {new Date(filter.dateMin).toLocaleDateString('fi-FI')} -{' '}
        {new Date(filter.dateMax).toLocaleDateString('fi-FI')} ✕
      </EuiButton>
    </EuiFlexItem>
  )
}

const ValueFilter = ({ filter, loading }) => {
  const ref = useRef()

  return (
    <EuiFlexItem grow={false}>
      <EuiButton
        // iconSide="right"
        // iconType="cross"
        isLoading={loading}
        onClick={(e) => {
          ref.current.onClick(e)
        }}
      >
        <FilterLink ref={ref} filter={filter}>
          <>
            {filter.label}: {filter.value} ✕
          </>
        </FilterLink>
      </EuiButton>
    </EuiFlexItem>
  )
}

export const SelectedFilters = ({ loading, data, customFilterComponents = {} }) => {
  const filterComponentMap = {
    ListFacet: ValueFilter,
    RangeSliderFacet: NumericRangeFilter,
    DateRangeFacet: DateRangeFilter,
    ComboBoxFacet: ValueFilter,
    HierarchicalMenuFacet: ValueFilter,
    ...customFilterComponents
  }
  return (
    <EuiFlexGroup gutterSize="s" alignItems="center">
      {data?.summary?.appliedFilters.map((filter) => {
        // Event type filter should not be visible as it is controller by Drupal markup (tabs) instead
        if(filter?.identifier === 'is_hobby') return

        const FilterComponent = filterComponentMap[filter.display] || ValueFilter
        if (!filterComponentMap[filter.display])
          throw new Error(
            `could not display selected filters for ${filter.identifier} facet. Use customFilterComponents prop to pass a component to handle this filter for ${filter.display} display`
          )
        return <FilterComponent filter={filter} loading={loading} key={filter.id} />
      })}
    </EuiFlexGroup>
  )
}
