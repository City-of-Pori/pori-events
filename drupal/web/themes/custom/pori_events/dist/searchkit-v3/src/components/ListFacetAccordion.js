import React from 'react'
import {
    EuiTitle,
    EuiFacetButton,
    EuiFacetGroup,
  } from '@elastic/eui';
  import { useSearchkit, FilterLink } from "@searchkit/client";

export const ListFacetAccordion = ({ facet, loading }) => {
    const api = useSearchkit();
  
    if (!facet) {
      return null;
    }
  
    const entries = facet.entries.map((entry) => {
      return (
        <EuiFacetButton
          style={{ height: "28px", marginTop: 0, marginBottom: 0 }}
          key={entry.label}
          quantity={entry.count}
          isSelected={api.isFilterSelected({
            identifier: facet.identifier,
            value: entry.label
          })}
          isLoading={loading}
        >
          <FilterLink
            filter={{ identifier: facet.identifier, value: entry.label }}
          >
            {entry.label}
          </FilterLink>
        </EuiFacetButton>
      );
    });
  
    return (
      <>
        <EuiTitle size="xxs">
          <h3>{facet.label}</h3>
        </EuiTitle>
        <EuiFacetGroup>{entries}</EuiFacetGroup>
      </>
    );
  };

export default ListFacetAccordion