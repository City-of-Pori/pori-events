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
  import { useSearchkit, FilterLink, useSearchkitVariables } from "@searchkit/client";
  import { useSearchParams } from "react-router-dom";
  import { stateToRoute } from "./../common/searchRouting";

export const BoolFacet = ({ facet, loading, name, style }) => {
    const api = useSearchkit();
    const variables = useSearchkitVariables();
    const [_, setSearchParams] = useSearchParams();
  
    if (!facet) {
      return null;
    }

    if(!style) {

    const entries = facet.entries.map((entry) => {
      const filter = {
        identifier: facet.identifier,
        value: entry.label,
    };
    const isSelected = api.isFilterSelected(filter);
      if(entry.label === 0) return
      return (
        <EuiFacetButton
          style={{ height: "28px", marginTop: 0, marginBottom: 0 }}
          key={entry.label}
          quantity={entry.count}
          isSelected={isSelected}
          isLoading={loading}
          // onClick={() => {
          //   api.toggleFilter({identifier: facet.identifier, value: true});
          //   api.search();
          // }}
          onClick={(e) => {
            let { filters } = variables;
            // ref.current[i].onClick(e)
            if (isSelected) {
              // remove on cilck
              filters = filters.filter(
                  (f) =>
                      !(
                          f.identifier === facet.identifier &&
                          f.value === entry.label
                      ),
              );
          } else {
              // add on click
              filters.push(filter);
          }
          setSearchParams(
            stateToRoute({
                ...variables,
                filters,
                page: {
                    from: 0,
                },
            }),
          );
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
        const filter = {
          identifier: facet.identifier,
          value: "true",
      };
      const isSelected = api.isFilterSelected(filter);
      if(entry.label === 0) return
      return (
        <EuiFacetButton
          style={{ height: "28px", marginTop: 0, marginBottom: 0 }}
          key={entry.label}
          // quantity={entry.count}
          isSelected={isSelected}
          isLoading={loading}
          // onClick={() => {
          //   api.toggleFilter({identifier: facet.identifier, value: "true"});
          //   api.search();
          // }}
          onClick={(e) => {
            let { filters } = variables;
            // ref.current[i].onClick(e)
            if (isSelected) {
              // remove on cilck
              filters = filters.filter(
                  (f) =>
                      !(
                          f.identifier === facet.identifier &&
                          f.value === "true"
                      ),
              );
          } else {
              // add on click
              filters.push(filter);
          }
          setSearchParams(
            stateToRoute({
                ...variables,
                filters,
                page: {
                    from: 0,
                },
            }),
          );
          }}
          // className={api.isFilterSelected({
          //   identifier: facet.identifier,
          //   value: true
          // }) ? 'isSelected' : 'notSelected'}
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
        <EuiFacetGroup layout="horizontal" gutterSize="s">{entries}</EuiFacetGroup>
      </>
    );

    }

  };

export default BoolFacet