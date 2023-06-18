import moment from "moment";

/**
 * Converts the current search state to a URL route.
 * Adapted from https://searchkit.co/docs/core/guides/url-synchronization
 *
 * @param {object} searchState Current search state
 * @returns {object} Route object
 */
export function stateToRoute(searchState) {
    // construct the routeState (adapted from Searchkit docs)
    const routeState = {
        query: searchState.query,
        sort: searchState.sortBy,
        size: Number(searchState.page?.size) || 12,
        from: Number(searchState.page?.from),
        scope: searchState.scope,
        op: searchState.operator,
    };
    console.log('routeState', routeState)
    console.log('searchState.filters', searchState.filters)
    searchState.filters.forEach((filter) => {
        // simplify filter representation
        // date filter is formatted differently
        console.log('filter7', filter)
        if (filter.identifier === "start_date_test") {
            routeState.dateMin = filter.dateMin
                ? moment.utc(filter.dateMin).format("YYYY-MM-DD")
                : undefined;
        } else if (filter.identifier === "end_date_test") {
            routeState.dateMax = filter.dateMax
                ? moment.utc(filter.dateMax).format("YYYY-MM-DD")
                : undefined;
        } else if (filter.identifier === "event_date") {
            // routeState.dateMax = filter.dateMax
            //     ? moment.utc(filter.dateMax).format("YYYY-MM-DD")
            //     : undefined;
            console.log('event_date_filter', filter)
            routeState.dateMin = filter.dateMin
            routeState.dateMax = filter.dateMax
        } else if (filter.identifier === "start_year") {
            routeState.yearMin = filter.yearMin ? filter.yearMin : undefined;
        } else if (filter.identifier === "end_year") {
            routeState.yearMax = filter.yearMax ? filter.yearMax : undefined;
        } else if (filter.level) {
            if (filter.level) {
                console.log('filter.level exsits', `${filter.identifier}_level`, filter.value, filter.level)
                if (Object.hasOwn(routeState, filter.identifier)) {
                    routeState[filter.identifier].push(filter.value);
                    
                    routeState[`${filter.identifier}_${filter.value}_level`] = filter.level;
                    console.log('1st level case:', filter)
                } else {
                    routeState[filter.identifier] = [filter.value];
                    routeState[`${filter.identifier}_${filter.value}_level`] = filter.level;
                    console.log('2nd level case:', filter)
                }
            }
        } else if (filter.value) {
            if (Object.hasOwn(routeState, filter.identifier)) {
                routeState[filter.identifier].push(filter.value);
            } else {
                routeState[filter.identifier] = [filter.value];
            }
        }
        console.log('stateToRoute22', routeState)
    });
    // transform into the object to pass to createURL (adapted from Searchkit docs)
    return Object.keys(routeState).reduce((sum, key) => {
        const s = sum;
        if (
            (Array.isArray(routeState[key]) && routeState[key].length > 0) ||
            (!Array.isArray(routeState[key]) && !!routeState[key])
        ) {
            s[key] = routeState[key];
        }
        console.log('stateToRoute-s', s)
        return s;
    }, {});
}
/**
 * Converts the current URL route to a search state.
 * Adapted from https://searchkit.co/docs/core/guides/url-synchronization
 *
 * @param {URLSearchParams} route Route object containing query, sort, filters, etc.
 * @returns {object} Search state object
 */
export function routeToState(route) {
    // construct the searchState (adapted from Searchkit docs)
    let searchState = {
        query: route.get("query") || "",
        sortBy: route.get("sort") || "",
        page: {
            size: Number(route.get("size")) || 25,
            from: Number(route.get("from")) || 0,
        },
        scope: route.get("scope") || "",
        operator: route.get("op") || "",
        filters: [],
    };
    console.log('searchState3', searchState)
    // get filters state back into format expected by Searchkit
    const identifierLevels = [];
    console.log('Array.from(route.entries())', Array.from(route.entries()))
    Array.from(route.entries())
        .filter(
            ([key, _val]) =>
                ![
                    "query", // only process filters, not query/sort/size/from/scope/operator
                    "sort",
                    "size",
                    "from",
                    "scope",
                    "op",
                    "dateMin", // also handle date filters separately
                    "dateMax",
                    "startDate", // new
                    "endDate", // new
                    "yearMin",
                    "yearMax",
                ].includes(key),
        )
        .forEach(([identifier, val]) => {
            // map each value of each filter to objects
            if (Array.isArray(val)) {
                console.log('val1', val)
                val.forEach((value) => {
                    if (identifier.includes("_level")) {
                        console.log('level3', identifier, val)
                        identifierLevels.push({
                            identifier,
                            level: value,
                        });
                        return;
                    }
                    searchState.filters.push({
                        identifier,
                        value,
                    });
                });
            } else {
                console.log('val2', val, identifier)
                if (identifier.includes("_level")) {
                    console.log('level4', val, identifier)
                    identifierLevels.push({
                        identifier,
                        level: Number(val),
                    });
                    return;
                }
                searchState.filters.push({
                    identifier,
                    value: val,
                });
            }
        });
    // if (route.has("dateMin")) {
    //     console.log('has1')
    //     searchState.filters.push({
    //         identifier: "start_date",
    //         // dateMin: moment.utc(route.get("dateMin")).toISOString(),
    //         dateMin: route.get("dateMin"),
    //     });
    // }
    // if (route.has("dateMax")) {
    //     console.log('has2')
    //     searchState.filters.push({
    //         identifier: "end_date",
    //         // dateMax: moment.utc(route.get("dateMax")).toISOString(),
    //         dateMax: route.get("dateMax"),
    //     });
    // }
    // if route.has dateMin and dateMax, add event_date filter
    if (route.has("dateMin") && route.has("dateMax")) {
        console.log('has4')
        searchState.filters.push({
            identifier: "event_date",
            dateMin: route.get("dateMin"),
            dateMax: route.get("dateMax"),
        });
    }
    if (route.has("yearMin")) {
        searchState.filters.push({
            identifier: "start_year",
            yearMin: route.get("yearMin"),
        });
    }
    if (route.has("yearMax")) {
        searchState.filters.push({
            identifier: "end_year",
            yearMax: route.get("yearMax"),
        });
    }

    // add filter levels for the filters based on the identifierLevels array
    identifierLevels.forEach((filter) => {
        console.log('filterLevel', filter)
        console.log('searchState.filters11', searchState.filters)
        const filterIndex = searchState.filters.findIndex(
            (f) => {
                const filterLevelSplit = filter.identifier.split("_");
                const filterIdentifier = filterLevelSplit[0];
                const filterValue = filterLevelSplit[1];
                const filterLevel = filterLevelSplit[2];
                console.log('identifierLevels filter identifier22', filter.identifier, filterIdentifier, filterValue, filterLevel)
                console.log('searchState filter33', f)
                // return f.identifier === filter.identifier.replace("_level", "")
                if(filterIdentifier == f.identifier && filterValue == f.value) {
                    console.log('isTrue')
                    return true;
                }
            },
        );
        if (filterIndex > -1) {
            console.log('searchState.filters[filterIndex]', searchState.filters[filterIndex])
            searchState.filters[filterIndex].level = filter.level;
        }
    });
    

    console.log('Search Routing: searchState', searchState, identifierLevels)
    return searchState;
}

/**
 * Check if the passed search state is the default search state, so that it does not
 * overwrite non-default state.
 *
 * @param {object} state The search state to check
 * @returns {boolean} True if the search state is the default, false if not
 */
export function isDefault(state) {
    return (
        !state.query &&
        (!state.filters || state.filters.length === 0) &&
        (!state.sortBy || state.sortBy === "date_asc") &&
        (!state.operator || state.operator === "or") &&
        state.page?.from === 0
    );
}

/**
 * Convert a sort state to a sortBy string to use in URL routing.
 *
 * @param {object} sortState The sort state to convert
 * @returns {string} String representation of the sort for URL routing
 */
export function getSortByFromState(sortState) {
    let sortBy = sortState?.field;
    // relevance does not use direction
    if (sortState.direction && sortBy !== "relevance") {
        const dir = sortState.direction === 1 ? "asc" : "desc";
        sortBy = `${sortState.field}_${dir}`;
    }
    return sortBy;
}