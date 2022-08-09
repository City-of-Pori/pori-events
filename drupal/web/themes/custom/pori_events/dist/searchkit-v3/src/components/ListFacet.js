import React, { useEffect, useRef } from "react";

import { useSearchkit, FilterLink } from "@searchkit/client";
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

export const ListFacet = ({ facet, loading, isAccordion }) => {
    const api = useSearchkit();
    const ref = useRef([]);
  
    useEffect(() => {
      ref.current = ref.current.slice(0, facet?.entries.length);
   }, [facet?.entries]);
  
    const entries = facet?.entries?.map((entry, i) => {
      return (
        <EuiFacetButton
          key={entry.label}
          style={{ height: "28px", marginTop: 0, marginBottom: 0 }}
          quantity={entry.count}
          isSelected={api.isFilterSelected({
            identifier: facet.identifier,
            value: entry.label
          })}
          isLoading={loading}
          onClick={(e) => {
            ref.current[i].onClick(e)
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