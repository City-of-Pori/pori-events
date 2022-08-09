import { BoolFacet } from "./BoolFacet";
import {
    EuiTitle,
    EuiFacetGroup,
  } from '@elastic/eui';

export const WeekdayFacet = (props) => {
    const { results, loading } = props;
   return (
    <>
    <EuiTitle size="xxs">
      <h3>{Drupal.t('Weekdays')}</h3>
    </EuiTitle>
    <EuiFacetGroup layout="horizontal" gutterSize="s" className="weekdayFacet">
        <BoolFacet facet={results?.facets[14]} loading={loading} name="MA" style="day" />
        <BoolFacet facet={results?.facets[15]} loading={loading} name="TI" style="day" />
        <BoolFacet facet={results?.facets[16]} loading={loading} name="KE" style="day" />
        <BoolFacet facet={results?.facets[17]} loading={loading} name="TO" style="day" />
        <BoolFacet facet={results?.facets[18]} loading={loading} name="PE" style="day" />
        <BoolFacet facet={results?.facets[19]} loading={loading} name="LA" style="day" />
        <BoolFacet facet={results?.facets[20]} loading={loading} name="SU" style="day" />
    </EuiFacetGroup>
    </>
    )
}

export default WeekdayFacet;