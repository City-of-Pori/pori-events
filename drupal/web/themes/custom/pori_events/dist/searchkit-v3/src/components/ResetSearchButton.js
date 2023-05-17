import { useSearchkit } from '@searchkit/client'
import { EuiButtonEmpty } from '@elastic/eui'
import { useState } from 'react'
import { useSearchParams } from "react-router-dom";
import { stateToRoute } from "../common/searchRouting";

export const ResetSearchButton = ({ loading }) => {
  const api = useSearchkit()
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.has("query") ? searchParams.get("query") : "");

  return (
    <EuiButtonEmpty
      disabled={!api.canResetSearch()}
      isLoading={loading}
      // onClick={() => {
      //   api.setQuery('');
      //   const currentFilters = api.getFilters()
      //   const currentEventType = currentFilters?.find((filter) => filter.identifier === 'is_hobby')
      //   if(currentEventType) {
      //       api.addFilter(currentEventType)
      //   }
      //   api.search();
      // }}
      onClick={() => {
        // reset query and date range
        setQuery("");
        api.setQuery("");
        // setDateRangeState({
        //     startDate: null,
        //     endDate: null,
        // });
        setSearchParams(
            stateToRoute({
                filters: [],
                query: "",
            }),
        );
    }}
    >
      {Drupal.t("Reset all filters")}
    </EuiButtonEmpty>
  )
}
