import React from 'react'
import extend from 'lodash/extend'
import { SearchkitManager,SearchkitProvider,
  SearchBox, RefinementListFilter, Pagination,
  NoHits, ResetFilters, ViewSwitcherHits,
  GroupedSelectedFilters, Layout, LayoutBody,
  LayoutResults, ActionBar, ActionBarRow, SideBar,
  QueryString, SearchkitComponent, Panel, HierarchicalRefinementFilter } from 'searchkit'
import { DateRangeFilter, DateRangeCalendar } from "searchkit-datefilter"
import Moment from 'moment';

const loc = window.location.origin;

let elasticServer = loc + '/api/search/searchkit/event-node';

const searchkit = new SearchkitManager(elasticServer)

searchkit.translateFunction = (key) => {
  let translations = {
    "searchbox.placeholder": Drupal.t("Search"),
    "NoHits.NoResultsFound": Drupal.t("No results found for") + " {query}",
    "pagination.previous": Drupal.t("Previous"),
    "pagination.next": Drupal.t("Next")
  }
  return translations[key]
}

const queryFields = [
  "title^10",
  "title.autocomplete^2",
  "short_description",
  "area^5",
  "description^2"
]

const queryOptions = {
  phrase_slop: 2,
}

const HitsListItem = (props)=> {
  const {bemBlocks, result} = props
  const source = extend({}, result._source, result.highlight)
  // If there's an url in the index, use it. Otherwise, fall back to Drupal node-id.
  const url = (source.url) ? source.url : '/node/' + result._id
  const image_source = (source.image_ext) ? (
  source.image_ext
  ) : "themes/custom/pori_events/dist/images/event-default.jpg";
  const title = (source.title) ? source.title : null;
  const leading = (source.short_description) ? source.short_description : null;

  const format = 'D.M.YYYY HH:MM'
  const start_time = Moment(source.start_time).format(format);
  const end_time = Moment(source.end_time).format(format);

  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <div className={bemBlocks.item("title")}>
        <div className="event__image__wrapper">
          <img src={image_source}/>
        </div>
        <div className="event__time">{start_time} - {end_time}</div>
        <h2 className="event__title">
          <a href={url} dangerouslySetInnerHTML={{__html:title}}></a>
        </h2>
        <div className="event__area">{source.area.value}</div>
        <div className="event__short_description">{leading}</div>
      </div>
    </div>
  )
}

class App extends SearchkitComponent {
  render() {
    return (
      <SearchkitProvider searchkit={searchkit}>
        <Layout>

          <LayoutBody>
            <SideBar>

              <SearchBox
                autofocus={false}
                searchOnChange={true}
                queryFields={queryFields}
                prefixQueryFields={queryFields}
                queryOptions={queryOptions}
                prefixQueryOptions={queryOptions}
                queryBuilder={QueryString}
                id="keyword"
              />

              <Panel
                collapsable={true}
                defaultCollapsed={true}
                title={Drupal.t("What")}>

                <RefinementListFilter
                  id="event_type"
                  field="event_type"
                  operator="OR"
                  size={100}
                />

              </Panel>

              <Panel
                collapsable={true}
                defaultCollapsed={true}
                title={Drupal.t("Where")}>
                  <HierarchicalRefinementFilter
                    field="area"
                    id="area"
                    title={''}
                  />

              </Panel>

              <Panel
                collapsable={true}
                defaultCollapsed={true}
                title={Drupal.t("When")}>

                <DateRangeFilter
                  id="event_date"
                  fromDateField="start_time"
                  toDateField="end_time"
                  calendarComponent={DateRangeCalendar}
                />

              </Panel>

              <Panel
                collapsable={true}
                defaultCollapsed={true}
                title={Drupal.t("For whom")}>

                <RefinementListFilter
                  id="audience"
                  field="audience"
                  operator="OR"
                  size={100}
                />

              </Panel>

            </SideBar>

          <LayoutResults>
            <ActionBar>

              <ActionBarRow>
                <GroupedSelectedFilters/>
                <ResetFilters translations={{"reset.clear_all":Drupal.t("Reset all filters")}}/>
              </ActionBarRow>

            </ActionBar>
            <ViewSwitcherHits
                hitsPerPage={12} highlightFields={["title"]}
                hitComponents={[
                  {key:"list", title:"List", itemComponent:HitsListItem}
                ]}
                scrollTo="body"
            />
            <NoHits suggestionsField={"title"}/>
            <Pagination showNumbers={true}/>
          </LayoutResults>

          </LayoutBody>

        </Layout>
      </SearchkitProvider>
    );
  }
}

export default App;
