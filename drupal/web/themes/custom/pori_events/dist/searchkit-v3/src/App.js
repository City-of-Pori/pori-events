import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Searchkit,
  MultiMatchQuery,
  RangeFacet,
  RefinementSelectFacet,
  HierarchicalMenuFacet,
  TermFilter,
} from '@searchkit/sdk';
import { useSearchkitVariables, useSearchkit, FilterLink, FilterLinkClickRef } from "@searchkit/client";
import { useSearchkitSDK } from "@searchkit/sdk/lib/esm/react-hooks";
import { AddEventHobbyBtn } from "./components/AddEventHobbyBtn";

import {
  FacetsList,
  // SearchBar,
  // ResetSearchButton,
  // SelectedFilters,
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
  EuiLink,
} from '@elastic/eui';
import { DateTime } from "luxon";
import { ListFacet } from './components/ListFacet'
import { WeekdayFacet } from './components/WeekdayFacet'
import { HierarchicalMenuFacetAccordion } from "./components/HierarchicalMenuFacetAccordion";
import { DateRangeFacetPicker } from "./components/DateRangeFacetPicker";
import DateRangeFacet from "./components/DateRangeFacetFilter";
import { BoolFacet } from "./components/BoolFacet";
import { ResetSearchButton } from "./components/ResetSearchButton";
import { SelectedFilters } from "./components/SelectedFilters";
import { SearchBar } from './components/SearchBar'
import '@elastic/eui/dist/eui_theme_light.css';
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';
import { routeToState, stateToRoute, getSortByFromState } from "./common/searchRouting";
import { useScope } from "./common/useScope";
import { useAdjustedSearchkitSDK } from "./common/useAdjustedSearchkitSDK";
const merge = require('lodash.merge');

// let elasticServer = "https://elasticsearch-tapahtumat.lndo.site";

const location = window.location.origin;
let elasticServer = location + "/api/searchkit";

// Description of result item
const Description = (props) => {
  const { text, date, days, hobbySubArea, hobbyLocationArea, eventArea, eventSubArea } = props;
  return <>
    {/* <EuiIcon type="calendar" /> */}
    <span className="event-date"> {date}</span>
    {days && <p> {days.map((day) => <EuiBadge color={'hollow'}>{day}</EuiBadge>)}</p>}

    <div className="event-area">
      {hobbySubArea?.length !== 0 && (
        <strong> {hobbySubArea},</strong>
      )}
      <strong> {hobbyLocationArea}</strong>

      {eventSubArea?.length !== 0 && (
        <strong> {eventSubArea},</strong>
      )} <strong>{eventArea}</strong>
    </div>
    <p className="event-description">{text}</p>
  </>
}

// Result item
const HitListItem = (hit) => {
  const getImageUrl = () => {
    const rawIndexedImagePath = hit.fields.image_ext;
    const image_ext_string = rawIndexedImagePath?.substring(rawIndexedImagePath.indexOf('/sites'))
    const root = window.location.origin;
    const completeImagePath = root + '/' + image_ext_string;
    const image_url = image_ext_string ? completeImagePath : "/themes/custom/pori_events/dist/images/event-default.jpg";
    return image_url;
  }

    const date_format = "dd.LL.yyyy";
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

    return <EuiFlexItem key={hit.id}>
             <EuiCard
        textAlign="left"
        image={
          <div>
            <img
              src={getImageUrl()}
              alt=""
            />
          </div>
        }
        title={<>
        <EuiLink href={hit.fields.url} external style={{ 'color': 'unset', 'textDecoration': 'unset' }}>
        {hit.fields.title}
        </EuiLink>
        </>}
        >
          <Description
          key={hit.fields.id}
          text={hit.fields.short_description}
          date={`${start_time_string} - ${end_time_string}`}
          days={weekDays}
          hobbySubArea={hit.fields.hobby_location_sub_area}
          hobbyLocationArea={hit.fields.hobby_location_area}
          eventArea={hit.fields.area}
          eventSubArea={hit.fields.area_sub_area}
          />
      </EuiCard>
    </EuiFlexItem>
}

// Results
const HitsList = ({ data }) => {

  return (
  <EuiFlexGrid gutterSize="l" className="event-list-wrapper">
    {data?.hits.items.map((hit) => (
        HitListItem(hit)
    ))}
  </EuiFlexGrid>
)}

const App = (props) => {
  const [eventType, setEventType] = useState(props?.eventType);

  const config = {
    host: elasticServer,
    connectionOptions: {
      // apiKey: '<api-key>', // optional - depends how you wish to connect to elasticsearch.
    },
    // index: '',
    hits: {
      fields: [
        'title',
        'description',
        'short_description',
        'hobby_category',
        'hobby_sub_category',
        'area',
        'area_sub_area',
        'hobby_location_sub_area',
        'hobby_location_area',
        'is_hobby',
        'image_ext',
        'id',
        'url',
        'start_time',
        'end_time',
        'single_day',
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
        label: 'Is hobby',
      }),
    ],
    query: new MultiMatchQuery({
      fields: [
        "title.autocomplete^10",
        "short_description",
        // "area^5",
        "description^2"
      ],
    }),
    facets: [
      new RefinementSelectFacet({
        field: 'is_hobby',
        identifier: 'is_hobby',
        label: 'Event / hobby',
        multipleSelect: false,
      }),
      new RefinementSelectFacet({
        field: 'event_type',
        identifier: 'event_type',
        // label: 'Event type2',
        label: Drupal.t('What'),
        multipleSelect: true,
        size: 100,
      }),
      new HierarchicalMenuFacet({
        fields: ["hobby_category", "hobby_sub_category"],
        identifier: 'hobby_category',
        // label: 'Hobby category',
        label: Drupal.t('What'),
        // size: 100,
      }),
      new HierarchicalMenuFacet({
        fields: ["area", "area_sub_area"],
        identifier: 'area',
        // label: 'Event location',
        label: Drupal.t('Where'),
        // size: 100,
      }),
      new HierarchicalMenuFacet({
        fields: ["hobby_location_area", "hobby_location_sub_area"],
        identifier: 'hobby_area',
        // label: 'Hobby location',
        label: Drupal.t('Where'),
      }),
      new DateRangeFacet({
        identifier: 'event_date',
        field: 'start_time',
        // label: 'Event date'
        label: Drupal.t('When'),
      }),
      new RefinementSelectFacet({
        field: 'timeframe',
        identifier: 'timeframe_of_day',
        // label: 'Day',
        label: Drupal.t('Timeframe of the day'),
        multipleSelect: true,
        size: 100,
      }),
      new RefinementSelectFacet({
        field: 'hobby_audience',
        identifier: 'hobby_audience',
        // label: 'Hobby audience',
        label: Drupal.t('For whom'),
        multipleSelect: true,
        size: 100,
      }),
      new RefinementSelectFacet({
        field: 'target_audience',
        identifier: 'target_audience',
        // label: 'Event audience',
        label: Drupal.t('For whom'),
        multipleSelect: true,
        size: 100
      }),
      new RefinementSelectFacet({
        field: 'registration',
        identifier: 'registration',
        // label: 'registration',
        label: Drupal.t('Registration required'),
        size: 100,
      }),
      new RefinementSelectFacet({
        field: 'accessible',
        identifier: 'accessible',
        // label: 'accessible',
        label: Drupal.t('Accessible'),
        size: 100,
      }),
      new RefinementSelectFacet({
        field: 'child_care',
        identifier: 'child_care',
        // label: 'Child care',
        label: Drupal.t('Child Care'),
        size: 100,
      }),
      new RefinementSelectFacet({
        field: 'free_enterance',
        identifier: 'free_enterance',
        // label: 'free entrance',
        label: Drupal.t('Free Entrance'),
        size: 100,
      }),
      new RefinementSelectFacet({
        field: 'culture_and_or_activity_no',
        identifier: 'culture_and_or_activity_no',
        // label: 'Culture and acitivity card',
        label: Drupal.t('Culture and Activity card'),
        size: 100,
      }),
  
      // Days for hobbies
  
      new RefinementSelectFacet({
        field: 'monday',
        identifier: 'monday',
        label: 'MA',
      }),
      new RefinementSelectFacet({
        field: 'tuesday',
        identifier: 'tuesday',
        label: 'TI',
      }),
      new RefinementSelectFacet({
        field: 'wednesday',
        identifier: 'wednesday',
        label: 'KE',
      }),
      new RefinementSelectFacet({
        field: 'thursday',
        identifier: 'thursday',
        label: 'TO',
      }),
      new RefinementSelectFacet({
        field: 'friday',
        identifier: 'friday',
        label: 'PE',
      }),
      new RefinementSelectFacet({
        field: 'saturday',
        identifier: 'saturday',
        label: 'LA',
      }),
      new RefinementSelectFacet({
        field: 'sunday',
        identifier: 'sunday',
        label: 'SU',
      }),
    ],

    sortOptions: [
      {
        id: 'multiple_sort',
        label: 'Multiple sort',
        field: [
          {single_day: {order: 'desc', unmapped_type: "long"}},
          {start_time: {order: 'asc', unmapped_type: "long"}},
          '_score',
        ],
        defaultOption: true,
      },
    ],
    // To set event / hobby filter. Pretyt messy at this moment, but had problems using spread operator / lodash merge. Should be refactored.
    postProcessRequest: (body) => {
      let bodyNormalized = body

      const adjustment = {
        post_filter: {
        "bool": {
                "must": [

                ]
            }
          }
        }

        _.merge(bodyNormalized, adjustment);

        bodyNormalized.post_filter.bool.must.push(
          {
            "bool": {
              "should": [
                {
                  "term": {
                    "is_hobby": (eventType == 'hobbies') ? true : false
                  }
                }
              ]
            }
          }
        )

      return {...bodyNormalized};
    },
  }
  

  // const Facets = FacetsList([]);

  // const [searchParams, setSearchParams] = useSearchParams();
  // const [query, setQuery] = useState(() =>
  // searchParams.has("query") ? searchParams.get("query") : "");
  const api = useSearchkit();
  let variables = useSearchkitVariables();
  variables.page.size = 12;
  // let variablesCustomized = variables
  // variablesCustomized.page.size = 12;

  // const {results, loading} = useSearchkitSDK(config, variables);
  const {results, loading} = useAdjustedSearchkitSDK(config, variables);
  console.log('results2', results)




  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() =>
      searchParams.has("query") ? searchParams.get("query") : "",
  );
  const [operator, setOperator] = useState(
      searchParams.has("op") ? searchParams.get("op") : "or",
  );
  // const [yearRangeState, setYearRangeState] = useYearFilter();
  const [scope, setScope] = useScope();
  // const api = useSearchkit();
  // const variables = useSearchkitVariables();

  // useEffect(() => {
  //     if (variables) {
  //         console.log('variables runs')
  //         setSearchParams(stateToRoute(variables));
  //     }
  // }, [variables]);

  // useEffect(() => {
  //   if(eventType) {
  //     setEventType(eventType.toLowerCase())
  //     // handleTypeChange(eventType)
  //   }
  // }, [])

  const sortStateMounted = useRef(false);
    const [sortState, setSortState] = useState(() => {
        // if (searchParams?.has("sort")) {
        //     const [field, dir] = searchParams.get("sort").split("_");
        //     const direction = dir === "asc" ? 1 : -1;
        //     return { field, direction };
        // }
        // default sort: short_display asc
        return {
            field: "entity",
            direction: 1,
        };
    });
    /**
     * Curried event listener function to set the sort state to a given field.
     *
     * @param {string} field The name of the field to sort on.
     * @returns {Function} The event listner function.
     */
    // const onSort = (field) => () => {
    //     if (sortState.field === field) {
    //         setSortState((prevState) => ({
    //             field,
    //             direction: -1 * prevState.direction,
    //         }));
    //     } else {
    //         setSortState({ field, direction: 1 });
    //     }
    // };

    // Use React Router useSearchParams to translate to and from URL query params
    useEffect(() => {
        if (api && searchParams) {
            console.log('routeToState runs=>', searchParams, routeToState(searchParams))
            api.setSearchState(routeToState(searchParams));
            api.search();
        }
    }, [searchParams, searchParams.has('event_type'), eventType]);
    // useEffect(() => {
    //     // handle sorting separately in order to only update in case of changes
    //     // use mounted ref to ensure we don't fire this effect on initial value
    //     if (!sortStateMounted.current) {
    //         sortStateMounted.current = true;
    //     } else if (sortState) {
    //         const sortBy = getSortByFromState(sortState);
    //         if (
    //             !searchParams.has("sort") ||
    //             searchParams.get("sort") !== sortBy
    //         ) {
    //             setSearchParams(
    //                 stateToRoute({
    //                     ...variables,
    //                     query,
    //                     sortBy,
    //                     scope,
    //                     operator,
    //                 }),
    //             );
    //         }
    //     }
    // }, [sortState]);
    // useEffect(() => {
    //     if (
    //         operator &&
    //         searchParams &&
    //         ((!searchParams.has("op") && operator !== "or") ||
    //             (searchParams.has("op") && searchParams.get("op") !== operator))
    //     ) {
    //         setSearchParams(
    //             stateToRoute({
    //                 ...variables,
    //                 query,
    //                 sortBy: getSortByFromState(sortState),
    //                 scope,
    //                 operator,
    //                 page: {
    //                     from: 0, // reset page to 0 on operator change; could exclude results!
    //                 },
    //             }),
    //         );
    //     }
    // }, [operator]);
    useEffect(() => {
        if (variables?.page?.from) {
            console.log('stateToRoute runs')
            setSearchParams(
                stateToRoute({
                    ...variables,
                    query,
                    sortBy: getSortByFromState(sortState),
                    scope,
                    operator,
                    page: {
                        from: variables.page.from,
                    },
                }),
            );
        }
    }, [variables?.page?.from]);


  // const handleTypeChange = (type) => {
  //   api.resetFilters();
  //   api.addFilter({identifier: 'is_hobby', value: type === 'hobbies' ? true : false});
  //   api.search();
  // }

  const handleSetQuery = (q) => {
    setQuery(q)
  }

  return (
    <EuiPage>
      <EuiPageSideBar>
        {(eventType === 'hobbies') && <AddEventHobbyBtn type="hobby" />}
        {(eventType === 'events') && <AddEventHobbyBtn type="event" />}
        { console.log('resultsMain', results) }
        <SearchBar loading={loading} query={query} setQuery={handleSetQuery} />
        <EuiHorizontalRule margin="m" />
        {/* <Facets data={results} loading={loading} /> */}
        { (eventType === 'events') && <ListFacet key={"1"} facet={results?.facets[1]} loading={loading} isAccordion />}
        { (eventType === 'hobbies') && <HierarchicalMenuFacetAccordion facet={results?.facets[2]} loading={loading} />}
        { (eventType === 'events') && <HierarchicalMenuFacetAccordion facet={results?.facets[3]} loading={loading} /> }
        { (eventType === 'hobbies') && <HierarchicalMenuFacetAccordion facet={results?.facets[4]} loading={loading} />}
        
        <Accordion key={'When'} preExpanded={['When']} allowMultipleExpanded allowZeroExpanded>
            <AccordionItem uuid={'When'}>
                <AccordionItemHeading>
                    <AccordionItemButton>
                      {Drupal.t('When')}
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                <DateRangeFacetPicker facet={results?.facets[5]} loading={loading} />
                  {(eventType === 'hobbies') && 
                  <>
                    <WeekdayFacet results={results} loading={loading} />
                    <ListFacet key={"2"} facet={results?.facets[6]} loading={loading} />
                  </>
                  }
                </AccordionItemPanel>
            </AccordionItem>
        </Accordion>

        { (eventType === 'hobbies') && <ListFacet key={"3"} facet={results?.facets[7]} loading={loading} isAccordion />} 
        { (eventType === 'events') && <ListFacet key={"4"} facet={results?.facets[8]} loading={loading} isAccordion />} 
        { (eventType === 'hobbies') && <>

        <Accordion key={'misc'} allowMultipleExpanded allowZeroExpanded>
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                      {Drupal.t('Refine your search')}
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <div className="refine-search">
                    <BoolFacet facet={results?.facets[9]} loading={loading} name={Drupal.t("Registration required")} />
                    <BoolFacet facet={results?.facets[10]} loading={loading} name={Drupal.t("Accessible")} />
                    <BoolFacet facet={results?.facets[11]} loading={loading} name={Drupal.t("Child Care")} />
                    <BoolFacet facet={results?.facets[12]} loading={loading} name={Drupal.t("Free Entrance")} />
                    <BoolFacet facet={results?.facets[13]} loading={loading} name={Drupal.t("Culture and Activity card")} />
                  </div>
                </AccordionItemPanel>
            </AccordionItem>
        </Accordion>
        </>
        } 
      </EuiPageSideBar>
      <EuiPageBody component="div">
        <EuiPageHeader>
          <EuiPageHeaderSection>
            {/* <span>Original:{eventTypeOriginal && eventTypeOriginal }</span> */}
          {/* <EventHobbySelector handleTypeChange={handleTypeChange} /> */}
            <EuiTitle size="l">
              <SelectedFilters data={results} loading={loading} />
            </EuiTitle>
          </EuiPageHeaderSection>
          <EuiPageHeaderSection>
            <ResetSearchButton loading={loading} />
          </EuiPageHeaderSection>
        </EuiPageHeader>
        <EuiPageContent>
          {/* <EuiPageContentHeader>
            <EuiPageContentHeaderSection>
              <EuiTitle size="s">
                <h2>{results?.summary.total} Results</h2>
              </EuiTitle>
            </EuiPageContentHeaderSection>
          </EuiPageContentHeader> */}
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
