import React from "react";
import extend from "lodash/extend";
import {
  SearchkitManager,
  SearchkitProvider,
  SearchBox,
  RefinementListFilter,
  Pagination,
  NoHits,
  ResetFilters,
  ViewSwitcherHits,
  GroupedSelectedFilters,
  Layout,
  LayoutBody,
  LayoutResults,
  ActionBar,
  ActionBarRow,
  SideBar,
  QueryString,
  SearchkitComponent,
  Panel,
  TermQuery,
  CheckboxFilter,
  HierarchicalMenuFilter
} from "searchkit";
import {DateRangeFilter, DateRangeCalendar} from "searchkit-datefilter";
import Moment from "moment";
import "moment/locale/fi";

Moment.locale("fi");

const loc = window.location.origin;

let elasticServer = loc + "/api/searchkit";

const searchkit = new SearchkitManager(elasticServer);

searchkit.translateFunction = key => {
  let translations = {
    "searchbox.placeholder": Drupal.t("Search"),
    "NoHits.NoResultsFound": Drupal.t("No results found for") + " {query}",
    "pagination.previous": Drupal.t("Previous"),
    "pagination.next": Drupal.t("Next")
  };
  return translations[key];
};

const queryFields = [
  "title.autocomplete^10",
  "short_description",
  "area^5",
  "description^2"
];
const queryOptions = {
  phrase_slop: 2
};

const HitsListItem = props => {
  const {bemBlocks, result} = props;
  const source = extend({}, result._source, result.highlight);
  // If there's an url in the index, use it. Otherwise, fall back to Drupal
  // node-id.
  const url = source.url ? source.url : "/node/" + result._id;
  const image_source = source.image_ext
    ? "/" + source.image_ext
    : "/themes/custom/pori_events/dist/images/event-default.jpg";
  const title = source.title ? source.title : null;
  const leading = source.short_description ? source.short_description : null;

  const date_format = "D.M.YYYY";
  const time_format = "HH:mm";

  const date_start = Moment(source.start_time).format(date_format);
  let date_end = "";
  if (source.end_time != null) {
    date_end = "- " + Moment(source.end_time).format(date_format);
  }


  let weekDays = [];
  if (source.monday === true) {
    weekDays.push("MA");
  }
  if (source.tuesday === true) {
    weekDays.push("TI");
  }
  if (source.wednesday === true) {
    weekDays.push("KE");
  }
  if (source.thursday === true) {
    weekDays.push("TO");
  }
  if (source.friday === true) {
    weekDays.push("PE");
  }
  if (source.saturday === true) {
    weekDays.push("LA");
  }
  if (source.sunday === true) {
    weekDays.push("SU");
  }
  const addDay = weekDays.join(" | ");

  return (
    <div
      className={bemBlocks.item().mix(bemBlocks.container("item"))}
      data-qa="hit"
    >
      <div className={bemBlocks.item("title")}>
        <div className="event__image__wrapper">
          <img src={image_source}/>
        </div>
        <div className="event__time">
          {date_start} {date_end}
        </div>
        <div className="event__weekdays">{addDay}</div>
        <h2 className="event__title">
          <a href={url} dangerouslySetInnerHTML={{__html: title}}/>
        </h2>
        <tag className="event__area">
          {source.area_sub_area.length !== 0 && (
            <tag> {source.area_sub_area},</tag>
          )} {source.area}
        </tag>
        <div className="hobby__area">
          {source.hobby_location_sub_area.length !== 0 && (
            <tag> {source.hobby_location_sub_area},</tag>
          )}
          <tag> {source.hobby_location_area}</tag>
        </div>
        <div className="event__short_description">{leading}</div>
      </div>
    </div>
  );
};

class App extends SearchkitComponent {
  componentDidMount() {
    let is_hobby = this.props.eventType === "hobbies" ? true : false;
    searchkit.addDefaultQuery(query => {
      return query.addQuery(TermQuery("is_hobby", is_hobby)).setSort([
        {
          single_day: {order: "desc", unmapped_type: "long"},
          start_time: {order: "asc", unmapped_type: "long"}
        }
      ]);
    });
  }

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
                className={`${this.props.eventType}--what`}
                collapsable={true}
                defaultCollapsed={true}
                title={Drupal.t("What")}
              >
                <RefinementListFilter
                  id="event_type"
                  field="event_type"
                  operator="OR"
                  size={100}
                />
              </Panel>
              <Panel
                className={`${this.props.eventType}--what-panel`}
                collapsable={true}
                defaultCollapsed={true}
                title={Drupal.t("What")}
              >
                <HierarchicalMenuFilter
                  id="hobby_category"
                  fields={["hobby_category", "hobby_sub_category"]}
                  operator="OR"
                  size={100}
                />
              </Panel>

              <Panel
                className={`${this.props.eventType}--where`}
                collapsable={true}
                defaultCollapsed={true}
                title={Drupal.t("Where")}
              >
                <HierarchicalMenuFilter
                  id="area"
                  fields={["area", "area_sub_area"]}
                  operator="OR"
                  size={100}
                />
              </Panel>
              <Panel
                className={`${this.props.eventType}--where-panel`}
                collapsable={true}
                defaultCollapsed={true}
                title={Drupal.t("Where")}
              >
                <HierarchicalMenuFilter
                  id="hobby_area"
                  fields={["hobby_location_area", "hobby_location_sub_area"]}
                  operator="OR"
                  size={100}
                />
              </Panel>

              <Panel
                className={`${this.props.eventType}--when-panel`}
                collapsable={true}
                defaultCollapsed={this.props.filterOpen}
                title={Drupal.t("When")}
              >
                <DateRangeFilter
                  id="event_date"
                  fromDateField="start_time"
                  toDateField="end_time"
                  calendarComponent={DateRangeCalendar}
                />
              </Panel>
              <Panel
                className={`${this.props.eventType}--when`}
                collapsable={true}
                defaultCollapsed={this.props.filterOpen}
                title={Drupal.t("When")}
              >
                <DateRangeFilter
                  id="event_date"
                  fromDateField="start_time"
                  toDateField="end_time"
                  calendarComponent={DateRangeCalendar}
                />
                <div className="weekdays_title">{Drupal.t("Weekdays")}</div>
                <div className="weekdays_filter--container">
                  <CheckboxFilter
                    id="monday"
                    field="monday"
                    label="MA"
                    filter={TermQuery("monday", true)}
                  />
                  <CheckboxFilter
                    id="tuesday"
                    field="tuesday"
                    label="TI"
                    filter={TermQuery("tuesday", true)}
                  />
                  <CheckboxFilter
                    id="wednesday"
                    field="wednesday"
                    label="KE"
                    filter={TermQuery("wednesday", true)}
                  />
                  <CheckboxFilter
                    id="thursday"
                    field="thursday"
                    label="TO"
                    filter={TermQuery("thursday", true)}
                  />
                  <CheckboxFilter
                    id="friday"
                    field="friday"
                    label="PE"
                    filter={TermQuery("friday", true)}
                  />
                  <CheckboxFilter
                    id="saturday"
                    field="saturday"
                    label="LA"
                    filter={TermQuery("saturday", true)}
                  />
                  <CheckboxFilter
                    id="sunday"
                    field="sunday"
                    label="SU"
                    filter={TermQuery("sunday", true)}
                  />
                </div>
                <RefinementListFilter
                  id="timeframe_of_day"
                  title={Drupal.t("Timeframe of the day")}
                  field="timeframe"
                  operator="OR"
                />
              </Panel>

              <Panel
                className={`${this.props.eventType}--whom-panel`}
                collapsable={true}
                defaultCollapsed={true}
                title={Drupal.t("For whom")}
              >
                <RefinementListFilter
                  id="target_audience"
                  field="target_audience"
                  operator="OR"
                  size={100}
                />
              </Panel>
              <Panel
                className={`${this.props.eventType}--whom`}
                collapsable={true}
                defaultCollapsed={true}
                title={Drupal.t("For whom")}
              >
                <RefinementListFilter
                  id="hobby_audience"
                  field="hobby_audience"
                  operator="OR"
                  size={100}
                />
              </Panel>
              <Panel
                className={`${this.props.eventType}--refine-event`}
                collapsable={true}
                defaultCollapsed={true}
                title={Drupal.t("Refine your search")}
              >
                <CheckboxFilter
                  id="registration"
                  field="registration"
                  label={Drupal.t("Registration required")}
                  filter={TermQuery("registration", true)}
                />
                <CheckboxFilter
                  id="accessible"
                  field="accessible"
                  label={Drupal.t("Accessible")}
                  filter={TermQuery("accessible", true)}
                />

                <CheckboxFilter
                  id="child_care"
                  field="child_care"
                  label={Drupal.t("Child Care")}
                  filter={TermQuery("child_care", true)}
                />

                <CheckboxFilter
                  id="free"
                  field="free_enterance"
                  label={Drupal.t("Free Entrance")}
                  filter={TermQuery("free_enterance", true)}
                />

                <CheckboxFilter
                  id="culture_and_or_activity_no"
                  field="culture_and_or_activity_no"
                  label={Drupal.t("Culture and Activity card")}
                  filter={TermQuery("culture_and_or_activity_no", true)}
                />
              </Panel>
            </SideBar>

            <LayoutResults className={this.props.eventType}>
              <ActionBar>
                <ActionBarRow>
                  <GroupedSelectedFilters/>
                  <ResetFilters
                    translations={{
                      "reset.clear_all": Drupal.t("Reset all filters")
                    }}
                  />
                </ActionBarRow>
              </ActionBar>
              <ViewSwitcherHits
                hitsPerPage={12}
                highlightFields={["title"]}
                hitComponents={[
                  {key: "list", title: "List", itemComponent: HitsListItem}
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
