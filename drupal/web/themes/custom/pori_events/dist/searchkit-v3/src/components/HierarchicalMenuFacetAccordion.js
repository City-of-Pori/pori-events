import React, { Fragment, useRef, useEffect } from 'react'
import { EuiFacetGroup, EuiTitle, EuiFacetButton, EuiAccordion } from '@elastic/eui'
import { useSearchkit, FilterLink, useSearchkitVariables } from '@searchkit/client'
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';
import { useSearchParams } from "react-router-dom";
import { stateToRoute } from "./../common/searchRouting";

const EntriesList = ({ entries, loading, facet }) => {
  const api = useSearchkit()
  const variables = useSearchkitVariables();
  const [_, setSearchParams] = useSearchParams();
  const ref = useRef([]);

  if (!facet) {
    return null;
  }

  const entriesElements = entries.map((entry, i) => {
    const filter = {
      identifier: facet.identifier,
      value: entry.label,
      level: entry.level
    };
    console.log('filter3', filter)
    const isSelected = api.isFilterSelected(filter);
    // console.log('isSelected', isSelected)
    return (
      <Fragment key={i}>
        <EuiFacetButton
          key={entry.label}
          style={{ height: '28px', marginTop: 0, marginBottom: 0 }}
          quantity={entry.count}
          isSelected={isSelected}
          isLoading={loading}
          onClick={(e) => {
            let { filters } = variables;
            console.log('filters2', filters)
            // ref.current[i].onClick(e)
            if (isSelected) {
              // remove on cilck
              console.log('remove on cilck')
              filters = filters.filter(
                  (f) =>
                      !(
                          f.identifier === facet.identifier &&
                          f.value === entry.label
                      ),
              );
          } else {
              // add on click
              console.log('filter8', filter)
              filters.push(filter);
          }
          console.log('filter9', filter, filters)
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
            ref={el => ref.current[i] = el} 
            filter={{ identifier: facet.identifier, value: entry.label, level: entry.level }}
          > */}
            {entry.label}
          {/* </FilterLink> */}
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
        // <EuiAccordion
        //   id={facet.identifier}
        //   buttonContent={facet.label}
        // >
        //   <EntriesList entries={facet.entries} facet={facet} loading={loading} />
        // </EuiAccordion>

        <Accordion key={facet.identifier} allowMultipleExpanded allowZeroExpanded>
        <AccordionItem>
            <AccordionItemHeading>
                <AccordionItemButton>
                {facet.label}
                </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel>
            <EntriesList entries={facet.entries} facet={facet} loading={loading} />
            </AccordionItemPanel>
        </AccordionItem>
        </Accordion>

      )
}

export default HierarchicalMenuFacetAccordion;