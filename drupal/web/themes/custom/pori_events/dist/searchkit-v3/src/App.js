import logo from './logo.svg';
import './App.css';

import {
  DateRangeFacet,
  MultiMatchQuery,
  RangeFacet,
  RefinementSelectFacet,
  HierarchicalMenuFacet,
} from '@searchkit/sdk';
import { useSearchkitVariables } from "@searchkit/client";
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
} from '@elastic/eui';
import { DateTime } from "luxon";
import { ListFacet } from "@searchkit/elastic-ui/lib/esm/Facets/ListFacet"
// import { ListFacetAccordion } from "./components/ListFacetAccordion";
import '@elastic/eui/dist/eui_theme_light.css';

let elasticServer = "https://elasticsearch-tapahtumat.lndo.site";

const config = {
  host: elasticServer,
  connectionOptions: {
    // apiKey: '<api-key>', // optional - depends how you wish to connect to elasticsearch.
  },
  index: 'event-node-fi',
  hits: {
    fields: ['title', 'description', 'short_description', 'hobby_category', 'hobby_sub_category', 'image_ext', 'id', 'url', 'start_time', 'end_time'],
  },
  query: new MultiMatchQuery({
    fields: [
      'title',
      'description',
      'short_description',
      'hobby_category',
      'hobby_sub_category',
      'area',
      'area_sub_area',
      'timeframe',
      'hobby_audience'
    ],
  }),
  facets: [
    new HierarchicalMenuFacet({
      fields: ["hobby_category", "hobby_sub_category"],
      identifier: 'hobby_category',
      label: 'What',
    }),
    new RefinementSelectFacet({
      field: 'event_type',
      identifier: 'event_type',
      label: 'What',
      multipleSelect: true,
    }),
    new HierarchicalMenuFacet({
      fields: ["area", "area_sub_area"],
      identifier: 'area',
      label: 'Where',
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
      label: 'Whom',
      multipleSelect: true,
    }),
  ],
};

const HitListItem = (hit) => {
  // image
  // const source = extend({}, result._source, result.highlight);
  const source = 'https://example.com/'
  // If there's an url in the index, use it. Otherwise, fall back to Drupal
  // node-id.
  const url = source.url ? source.url : "/node/" + hit.fields.id;
  const image_source = hit.fields.image_ext
    ? "/" + hit.fields.image_ext
    : "/themes/custom/pori_events/dist/images/event-default.jpg";

    const date_format = "dd-LL-yyyy";
  
    const start_time_string = DateTime.fromISO(hit.fields.start_time).setLocale('fi')
    .toFormat(date_format);
    const end_time_string = DateTime.fromISO(hit.fields.start_time).setLocale('fi')
    .toFormat(date_format);
    

    return <EuiFlexGroup gutterSize="xl">
    <EuiFlexItem>
      <EuiFlexGroup>
        <EuiFlexItem grow={4}>
        <EuiImage
          alt={hit.fields.title}
          src={image_source}
        />
        <span>{start_time_string} - {end_time_string}</span>
          <EuiTitle size="xs">
            <h6>{hit.fields.title}</h6>
          </EuiTitle>
          <EuiText grow={false}>
            <p>{hit.fields.short_description}</p>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
  </EuiFlexGroup>

}

const HitsList = ({ data }) => {

  return (
  <EuiFlexGrid>
    {data?.hits.items.map((hit) => (
      <EuiFlexItem key={hit.id}>
        {HitListItem(hit)}
      </EuiFlexItem>
    ))}
  </EuiFlexGrid>
)}


function App() {
  const Facets = FacetsList([]);
  const variables = useSearchkitVariables();
  const {results, loading} = useSearchkitSDK(config, variables);
  // return <div>results {results?.summary?.total}</div>;
  // console.log('facets', Facets)
console.log('results111', results)

  const getListFacet = () => {
    if (typeof(results?.facets[0]) !== 'undefined' ) {
        return (
        <div key={results.facets[0].identifier}>
          <ListFacet facet={results.facets[0]} loading={loading} />
        </div>)
    }
  }

  return (
    <EuiPage>
      <EuiPageSideBar>
        <SearchBar loading={loading} />
        <EuiHorizontalRule margin="m" />
        <Facets data={results} loading={loading} />
        {/* { getListFacet() } */}
      </EuiPageSideBar>
      <EuiPageBody component="div">
        <EuiPageHeader>
          <EuiPageHeaderSection>
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
