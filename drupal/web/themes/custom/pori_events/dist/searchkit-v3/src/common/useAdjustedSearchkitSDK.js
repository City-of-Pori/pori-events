import { useEffect, useState } from 'react'
import Searchkit from '@searchkit/sdk';
import { useSearchParams } from "react-router-dom";
import { routeToState } from "./searchRouting";

export const useAdjustedSearchkitSDK = (
  config,
  variables
) => {
  const [results, setResponse] = useState(null)
  const [loading, setLoading] = useState(true)

  const [searchParams, _] = useSearchParams();

//   useEffect(() => {
//     async function fetchData(variables) {
//       setLoading(true)
//       const request = Searchkit(config)
//         .query(variables.query)
//         .setFilters(variables.filters)
//         .setSortBy(variables.sortBy)

//       const response = await request.execute({
//         facets: true,
//         hits: {
//           size: variables.page.size,
//           from: variables.page.from
//         }
//       })
//       setLoading(false)
//       setResponse(response)
//     }

//     variables && fetchData(variables)
//   }, [variables, searchParams])

    //   other requests with filters applied, if/whenever they change
      useEffect(() => {
        async function fetchData(variables) {
            setLoading(true)
            const request = Searchkit(config)
              .query(variables.query)
              .setFilters(variables.filters)
              .setSortBy(variables.sortBy)
      
            const response = await request.execute({
              facets: true,
              hits: {
                size: variables.page.size,
                from: variables.page.from
              }
            })
            setLoading(false)
            setResponse(response)
          }
        // if (searchParams) {
            fetchData(routeToState(searchParams));
        // }
    }, [searchParams]);

  return { results, loading }
}
