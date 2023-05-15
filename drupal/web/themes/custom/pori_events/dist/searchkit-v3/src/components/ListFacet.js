import React, { useEffect, useRef } from "react";

import { useSearchkit, FilterLink, useSearchkitVariables } from "@searchkit/client";
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
  } from 'react-accessible-accordion';
  import {
    EuiTitle,
    EuiFacetButton,
    EuiFacetGroup,
  } from '@elastic/eui';
import { useSearchParams } from "react-router-dom";
import { stateToRoute } from "./../common/searchRouting";

export const ListFacet = ({ facet, loading, isAccordion }) => {
    const api = useSearchkit();
    const variables = useSearchkitVariables();
    const [_, setSearchParams] = useSearchParams();
    const ref = useRef([]);
  
    useEffect(() => {
      ref.current = ref.current.slice(0, facet?.entries.length);
   }, [facet?.entries]);
  
    const entries = facet?.entries?.map((entry, i) => {
      const filter = {
        identifier: facet.identifier,
        value: entry.label,
    };
    const isSelected = api.isFilterSelected(filter);
      return (
        <EuiFacetButton
          key={entry.label}
          style={{ height: "28px", marginTop: 0, marginBottom: 0 }}
          quantity={entry.count}
          isSelected={isSelected}
          isLoading={loading}
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
          <FilterLink
            ref={el => ref.current[i] = el} 
            filter={{ identifier: facet.identifier, value: entry.label }}
          >
            {entry.label}
          </FilterLink>
        </EuiFacetButton>
      );
    });
  
    if (!facet) {
      return null;
    }
  
    if(!isAccordion) {
      return (
        <>
        <EuiTitle size="xxs">
          <h3>{facet.label}</h3>
          </EuiTitle>
        <EuiFacetGroup> {entries}</EuiFacetGroup>
        </>
      )
    }
  
    return (
  <Accordion key={facet.identifier} allowMultipleExpanded allowZeroExpanded>
  <AccordionItem>
      <AccordionItemHeading>
          <AccordionItemButton>
          {facet.label}
          </AccordionItemButton>
      </AccordionItemHeading>
      <AccordionItemPanel>
      <EuiFacetGroup>{entries}</EuiFacetGroup>
      </AccordionItemPanel>
  </AccordionItem>
  </Accordion>
    );
  };
  
export default ListFacet;