import React from 'react'
import {
    EuiTitle,
    EuiFacetButton,
    EuiFacetGroup,
    EuiButtonEmpty,
    EuiFlexGroup,
    EuiFlexItem
  } from '@elastic/eui';
  //import { EuiButtonEmpty, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
  import { useSearchkit, FilterLink } from "@searchkit/client";

export const BoolFacet = ({ facet, loading, name, style }) => {
    const api = useSearchkit();
  
    if (!facet) {
      return null;
    }

    console.log
  
    if(!style) {

    const entries = facet.entries.map((entry) => {
        console.log('entry111', facet)
      if(entry.label === 0) return
      return (
        <EuiFacetButton
          style={{ height: "28px", marginTop: 0, marginBottom: 0 }}
          key={entry.label}
          quantity={entry.count}
          isSelected={api.isFilterSelected({
            identifier: facet.identifier,
            value: true
          })}
          isLoading={loading}
          onClick={() => {
            api.toggleFilter({identifier: facet.identifier, value: true});
            api.search();
          }}
        >
          {/* <FilterLink
            filter={{ identifier: facet.identifier, value: entry.label }}
          > */}
            {name}
          {/* </FilterLink> */}
        </EuiFacetButton>
      );
    });
  
    return (
      <>
        {/* <EuiTitle size="xxs">
          <h3>{facet.label}</h3>
        </EuiTitle> */}
        <EuiFacetGroup>{entries}</EuiFacetGroup>
      </>
    );

    }

    if(style === 'day') {
      const entries = facet.entries.map((entry) => {
        console.log('entry111', facet)
      if(entry.label === 0) return
      return (
        <EuiFacetButton
          style={{ height: "28px", marginTop: 0, marginBottom: 0 }}
          key={entry.label}
          // quantity={entry.count}
          isSelected={api.isFilterSelected({
            identifier: facet.identifier,
            value: true
          })}
          isLoading={loading}
          onClick={() => {
            api.toggleFilter({identifier: facet.identifier, value: true});
            api.search();
          }}
        >
                    { console.log('facet23', facet.identifier) }
          {/* <FilterLink
            filter={{ identifier: facet.identifier, value: entry.label }}
          > */}
            {name}
          {/* </FilterLink> */}
        </EuiFacetButton>
      );
    });
  
    return (
      <>
        {/* <EuiTitle size="xxs">
          <h3>{facet.label}</h3>
        </EuiTitle> */}
        <EuiFacetGroup layout="horizontal" gutterSize="s">{entries}</EuiFacetGroup>
      </>
    );

    }

  };

export default BoolFacet