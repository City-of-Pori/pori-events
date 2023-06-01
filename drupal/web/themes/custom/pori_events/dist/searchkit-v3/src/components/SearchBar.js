import React from 'react'
import { useSearchkit, useSearchkitQueryValue, useSearchkitVariables } from '@searchkit/client'
import { EuiFieldSearch } from '@elastic/eui'
import { useSearchParams } from "react-router-dom";
import { stateToRoute } from "./../common/searchRouting";

export const SearchBar = (props) => {
  // const [query, setQuery] = useSearchkitQueryValue()
  const {loading, query, setQuery} = props
  const api = useSearchkit()
  const variables = useSearchkitVariables();
  const [_, setSearchParams] = useSearchParams();
//   const ref = useRef([]);

  return (
    <EuiFieldSearch
      placeholder={Drupal.t('Search')}
      value={query}
      onChange={(e) => {
        console.log('e.target.value', e.target.value)
        setQuery(e.target.value)
      }}
      isLoading={loading}
      onSearch={(value) => {
        let { filters } = variables;

        setQuery(value)
        api.setQuery(value)
        api.search()
      }}
    //   isClearable
      aria-label="Search"
    />
  )
}
