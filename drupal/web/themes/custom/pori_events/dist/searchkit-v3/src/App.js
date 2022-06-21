import logo from './logo.svg';
import './App.css';
import { useState, useEffect, useRef } from "react";
import {
  Searchkit,
  DateRangeFacet,
  MultiMatchQuery,
  RangeFacet,
  RefinementSelectFacet,
  HierarchicalMenuFacet,
  TermFilter,
} from '@searchkit/sdk';
import { useSearchkitVariables, useSearchkit, FilterLink, FilterLinkClickRef } from "@searchkit/client";
import { useSearchkitSDK } from "@searchkit/sdk/lib/esm/react-hooks";

import {
  FacetsList,
  SearchBar,
  ResetSearchButton,
  SelectedFilters,
  Pagination,
} from '@searchkit/elastic-ui';

import {
  EuiPage,
  EuiFlexGrid,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiPageSideBar,
  EuiTitle,
  EuiHorizontalRule,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiImage,
  EuiButtonGroup,
  EuiFacetButton,
  EuiFacetGroup,
  EuiPanel,
  EuiCard,
  EuiIcon,
  EuiBadge,
  EuiAccordion,
} from '@elastic/eui';
import { DateTime } from "luxon";
// import { ListFacet } from "@searchkit/elastic-ui/lib/esm/Facets/ListFacet"
import { ListFacetAccordion } from "./components/ListFacetAccordion";
import { HierarchicalMenuFacetAccordion } from "./components/HierarchicalMenuFacetAccordion";
import { EventHobbySelector } from "./components/EventHobbySelector";
import '@elastic/eui/dist/eui_theme_light.css';

let elasticServer = "https://elasticsearch-tapahtumat.lndo.site";

const config = {
  host: elasticServer,
  connectionOptions: {
    // apiKey: '<api-key>', // optional - depends how you wish to connect to elasticsearch.
  },
  index: 'event-node-fi',
  hits: {
    fields: [
      'title',
      'description',
      'short_description',
      'hobby_category',
      'hobby_sub_category',
      'area_sub_area',
      'hobby_location_sub_area',
      'hobby_location_area',
      'is_hobby',
      'image_ext',
      'id',
      'url',
      'start_time',
      'end_time',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ],
  },
  filters: [
    new TermFilter({
      identifier: 'is_hobby',
      field: 'is_hobby',
      label: 'is_hobby',
    }),
  ],
  query: new MultiMatchQuery({
    fields: [
      'title',
      'description',
      'short_description',
    ],
  }),
  facets: [
    new RefinementSelectFacet({
      field: 'is_hobby',
      identifier: 'is_hobby',
      label: 'is_hobby',
      multipleSelect: false,
    }),
    new RefinementSelectFacet({
      field: 'event_type',
      identifier: 'event_type',
      label: 'Event type',
      multipleSelect: true,
    }),
    new HierarchicalMenuFacet({
      fields: ["hobby_category", "hobby_sub_category"],
      identifier: 'hobby_category',
      label: 'Hobby category',
    }),
    new HierarchicalMenuFacet({
      fields: ["area", "area_sub_area"],
      identifier: 'area',
      label: 'Event location',
    }),
    new HierarchicalMenuFacet({
      fields: ["hobby_location_area", "hobby_location_sub_area"],
      identifier: 'hobby_area',
      label: 'Hobby location',
    }),
    new DateRangeFacet({
      identifier: 'event_date',
      field: 'start_time',
      label: 'Event date'
    }),
    new RefinementSelectFacet({
      field: 'timeframe',
      identifier: 'timeframe_of_day',
      label: 'Day',
      multipleSelect: true,
    }),
    new RefinementSelectFacet({
      field: 'hobby_audience',
      identifier: 'hobby_audience',
      label: 'Hobby audience',
      multipleSelect: true,
    }),
    new RefinementSelectFacet({
      field: 'target_audience',
      identifier: 'target_audience',
      label: 'Event audience',
      multipleSelect: true,
    }),
  ],
}


// Description of result item
const Description = (props) => {
  const { text, date, days, hobbySubArea, hobby_location_area } = props;
  // console.log('hobbySubArea', props)
  return <>
  <EuiIcon type="calendar" />
  <span> {date}</span>
  <p> {days.map((day) => <EuiBadge color={'hollow'}>{day}</EuiBadge>)}</p>
  { hobbySubArea.length > 0 && <><EuiIcon type="mapMarker" />
  <span> {hobbySubArea?.map((area) => <span>{area}</span>)} {hobby_location_area}</span></>
  }
  <p>{text}</p>
  </>
}

// Result item
const HitListItem = (hit) => {
  // image
  // const source = extend({}, result._source, result.highlight);
  const source = 'https://example.com/'
  // If there's an url in the index, use it. Otherwise, fall back to Drupal
  // node-id.
  const url = source.url ? source.url : "/node/" + hit.fields.id;
  let image_source = hit.fields.image_ext
    ? hit.fields.image_ext
    : "/themes/custom/pori_events/dist/images/event-default.jpg";
    image_source = image_source.replace('at.lndo.site', 'https://tapahtumat.pori.fi')
    const date_format = "dd-LL-yyyy";
  
    const start_time_string = DateTime.fromISO(hit.fields.start_time).setLocale('fi')
    .toFormat(date_format);
    const end_time_string = DateTime.fromISO(hit.fields.end_time).setLocale('fi')
    .toFormat(date_format);

    let weekDays = [];
    if (hit.fields.monday === true) {
      weekDays.push("MA");
    }
    if (hit.fields.tuesday === true) {
      weekDays.push("TI");
    }
    if (hit.fields.wednesday === true) {
      weekDays.push("KE");
    }
    if (hit.fields.thursday === true) {
      weekDays.push("TO");
    }
    if (hit.fields.friday === true) {
      weekDays.push("PE");
    }
    if (hit.fields.saturday === true) {
      weekDays.push("LA");
    }
    if (hit.fields.sunday === true) {
      weekDays.push("SU");
    }

    return <EuiFlexItem key={hit.id} style={{'maxWidth': '28%'}}>
             <EuiCard
        textAlign="left"
        image={
          <div>
            <img
              src={image_source}
              alt={hit.fields.title}
            />
          </div>
        }
        title={hit.fields.title}
        description={<Description text={hit.fields.short_description} date={` ${start_time_string} - ${end_time_string}`} days={weekDays} hobbySubArea={hit.fields.hobby_location_sub_area} hobbyLocationArea={hit.fields.hobby_location_area} />}
      />
    </EuiFlexItem>
}

// Results
const HitsList = ({ data }) => {

  return (
  <EuiFlexGrid gutterSize="l">
    {data?.hits.items.map((hit) => (
        HitListItem(hit)
    ))}
  </EuiFlexGrid>
)}

const ListFacet = ({ facet, loading }) => {
  const api = useSearchkit();
  if (!facet) {
    return null;
  }
  
  const entries = facet.entries.map((entry) => {
    // const ref = useRef(FilterLinkClickRef);
    
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
        // onClick={(e) => {
        //   ref.current.onClick(e)
        // }}
      >
        <FilterLink
          // ref={ref}
          filter={{ identifier: facet.identifier, value: entry.label }}
        >
          {entry.label}
        </FilterLink>
      </EuiFacetButton>
    );
  });

  return (
    <EuiAccordion
      id={facet.identifier}
      buttonContent={facet.label}
    >
      <EuiFacetGroup>{entries}</EuiFacetGroup>
    </EuiAccordion>
  );
};

function App() {
  const Facets = FacetsList([]);
  const variables = useSearchkitVariables();
  const {results, loading} = useSearchkitSDK(config, variables);

  const [eventType, setEventType] = useState('event')

  // const eventTypes = [
  //   {
  //     id: `event`,
  //     label: 'Event',
  //   },
  //   {
  //     id: `hobby`,
  //     label: 'Hobby',
  //   },
  // ]

  const handleTypeChange = (type) => {
    console.log('type123', type)
    setEventType(type)
  }

  return (
    <EuiPage>
      <EuiPageSideBar>
        <SearchBar loading={loading} />
        <EuiHorizontalRule margin="m" />
        {/* <Facets data={results} loading={loading} /> */}
        {/* <ListFacet facet={results?.facets[0]} loading={loading} /> */}
        { (eventType === 'event') && <ListFacet facet={results?.facets[1]} loading={loading} />}
        { (eventType === 'hobby') && <HierarchicalMenuFacetAccordion facet={results?.facets[2]} loading={loading} />}
        { (eventType === 'event') && <HierarchicalMenuFacetAccordion facet={results?.facets[3]} loading={loading} /> }
        { (eventType === 'hobby') && <HierarchicalMenuFacetAccordion facet={results?.facets[4]} loading={loading} />}
        { (eventType === 'hobby') && <ListFacet facet={results?.facets[7]} loading={loading} />} 
        { (eventType === 'event') && <ListFacet facet={results?.facets[8]} loading={loading} />} 
      </EuiPageSideBar>
      <EuiPageBody component="div">
        <EuiPageHeader>
          <EuiPageHeaderSection>
          {/* <EuiButtonGroup
            legend="This is a basic group"
            options={eventTypes}
            idSelected={eventType}
            onChange={(id) => eventTypeOnChange(id)}
          /> */}
          <EventHobbySelector handleTypeChange={handleTypeChange} />
            <EuiTitle size="l">
              <SelectedFilters data={results} loading={loading} />
            </EuiTitle>
          </EuiPageHeaderSection>
          <EuiPageHeaderSection>
            <ResetSearchButton loading={loading} />
          </EuiPageHeaderSection>
        </EuiPageHeader>
        <EuiPageContent>
          <EuiPageContentHeader>
            <EuiPageContentHeaderSection>
                <h2>{ eventType }</h2>
              <EuiTitle size="s">
                <h2>{results?.summary.total} Results</h2>
              </EuiTitle>
            </EuiPageContentHeaderSection>
          </EuiPageContentHeader>
          <EuiPageContentBody>
            <HitsList data={results} />
            <EuiFlexGroup justifyContent="spaceAround">
              <Pagination data={results} />
            </EuiFlexGroup>
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
}

export default App;
