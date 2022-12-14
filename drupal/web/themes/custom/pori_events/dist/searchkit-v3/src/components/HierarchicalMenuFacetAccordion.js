import React, { Fragment, useRef, useEffect } from 'react'
import { EuiFacetGroup, EuiTitle, EuiFacetButton, EuiAccordion } from '@elastic/eui'
import { useSearchkit, FilterLink } from '@searchkit/client'
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';

const EntriesList = ({ entries, loading, facet }) => {
  const api = useSearchkit()
  const ref = useRef([]);

  if (!facet) {
    return null;
  }

  useEffect(() => {
    console.log('facet', facet)
 }, [facet.entries]);

  const entriesElements = entries.map((entry, i) => {
    console.log('entries', entries)
    return (
      <Fragment key={i}>
        <EuiFacetButton
          key={entry.label}
          style={{ height: '28px', marginTop: 0, marginBottom: 0 }}
          quantity={entry.count}
          isSelected={api.isFilterSelected({
            identifier: facet.identifier,
            value: entry.label,
            level: entry.level
          })}
          isLoading={loading}
          onClick={(e) => {
            ref.current[i].onClick(e)
          }}
        >
          <FilterLink
            ref={el => ref.current[i] = el} 
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