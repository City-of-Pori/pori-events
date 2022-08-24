import isUndefined from 'lodash/isUndefined';

export default class DateRangeFacet {
    constructor(config) {
        this.config = config;
        this.excludeOwnFilters = true;
    }
    getLabel() {
        return this.config.label;
    }
    getIdentifier() {
        return this.config.identifier;
    }
    getFilters(filters) {
        const q = {
            "bool": {
                "must": {
                    "range": {
                        "start_time": {
                            "gte": filters[0].dateMin,
                            "lte": filters[0].dateMax,
                        }
                    },
                    "range": {
                        "end_time": {
                            "gte": filters[0].dateMin,
                            "lte": filters[0].dateMax,
                        }
                    }
                }
            }
        }

        return q;
    }
    getAggregation() {
        return {};
    }
    getSelectedFilter(filterSet) {
        return {
            type: 'DateRangeSelectedFilter',
            id: `${this.getIdentifier()}_${filterSet.dateMin}_${filterSet.dateMax}`,
            identifier: this.getIdentifier(),
            label: this.getLabel(),
            dateMin: filterSet.dateMin,
            dateMax: filterSet.dateMax,
            display: this.config.display || 'DateRangeFacet'
        };
    }
    transformResponse() {
        return {
            identifier: this.getIdentifier(),
            label: this.getLabel(),
            type: 'DateRangeFacet',
            display: this.config.display || 'DateRangeFacet',
            entries: null
        };
    }
}
// exports.default = DateRangeFacet;
